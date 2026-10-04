import {
	ACESFilmicToneMapping,
	Box3,
	CanvasTexture,
	Color,
	DirectionalLight,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PMREMGenerator,
	Scene,
	Vector3,
	WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = '/auto.glb';
const DRACO_PATH = '/draco/';
// Lunas laterales y posterior. El parabrisas ("Glass_ext") y los faros no se tocan.
const TINTED_GLASS = 'Glass_ext-tinted';

const GLASS_CLEAR = new Color('#33404c');
const GLASS_DARK = new Color('#04060b');
const OPACITY_CLEAR = 0.16;
const OPACITY_DARK = 0.96;

// Carrocería: la textura original es gris oscura y casi no contrasta con las lunas.
const PAINT = 'Car_Paint_-_All_Colors';
const PAINT_COLOR = '#c9ced6';
const PAINT_METALNESS = 0.9;
const PAINT_ROUGHNESS = 0.36;

// Showroom oscuro: poco entorno para que el plateado tenga tonos medios y una luz cenital
// casi vertical: una luz frontal o rasante se refleja en las lunas y tapa el tinte al girar.
const ENVIRONMENT_INTENSITY = 0.65;
const EXPOSURE = 0.95;
const REFLECTION_OPACITY = 0.1; // reflejo del auto sobre el piso

const FOV = 28; // horizontal: el encuadre no cambia con la proporción del escenario
const FIT_MARGIN = 1.02; // aire mínimo: la perspectiva agranda el extremo cercano del auto
const CAMERA_LIFT = 0.12; // altura de la cámara, en proporción a la distancia
const SWAY_AMPLITUDE = 0.35; // rad (±20°)
const SWAY_SPEED = 0.4; // rad/s de fase
const DRAG_SPEED = 0.008; // rad/px
const RESUME_DELAY = 1500; // ms sin arrastrar antes de retomar el vaivén

export interface CarViewer {
	/** 0 = lunas claras, 1 = lunas oscuras */
	setTint(value: number): void;
	setRunning(running: boolean): void;
	render(): void;
	canvas: HTMLCanvasElement;
}

export interface CarViewerOptions {
	/** Ángulo central del vaivén en radianes; -π/2 = perfil mirando a la izquierda. */
	rotation?: number;
}

export function hasWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
	} catch {
		return false;
	}
}

/** Mancha radial apoyada en el piso; `alphas` son las opacidades en el centro, al 55 % y en el borde. */
function createGroundDisc(
	width: number,
	depth: number,
	rgb: string,
	alphas: [number, number, number],
): Mesh {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	gradient.addColorStop(0, `rgba(${rgb}, ${alphas[0]})`);
	gradient.addColorStop(0.55, `rgba(${rgb}, ${alphas[1]})`);
	gradient.addColorStop(1, `rgba(${rgb}, ${alphas[2]})`);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);

	const disc = new Mesh(
		new PlaneGeometry(width, depth),
		new MeshBasicMaterial({ map: new CanvasTexture(canvas), transparent: true, depthWrite: false }),
	);
	disc.rotation.x = -Math.PI / 2;
	return disc;
}

export async function createCarViewer(
	container: HTMLElement,
	{ rotation = 0.45 - Math.PI / 2 }: CarViewerOptions = {},
): Promise<CarViewer> {
	const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_PATH);
	const gltf = await new GLTFLoader().setDRACOLoader(dracoLoader).loadAsync(MODEL_URL);
	dracoLoader.dispose();

	const renderer = new WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearAlpha(0);
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = EXPOSURE;

	const scene = new Scene();

	const pmrem = new PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environmentIntensity = ENVIRONMENT_INTENSITY;
	pmrem.dispose();
	const keyLight = new DirectionalLight('#ffffff', 1.6);
	keyLight.position.set(0.3, 10, 1);
	scene.add(keyLight);

	// Centra el modelo sobre el origen, apoyado en y = 0.
	const model = gltf.scene;
	const box = new Box3().setFromObject(model);
	const size = box.getSize(new Vector3());
	const center = box.getCenter(new Vector3());
	model.position.set(-center.x, -box.min.y, -center.z);

	const car = new Group();
	car.add(model);
	const shadow = createGroundDisc(size.x * 1.5, size.z * 1.12, '3, 8, 20', [0.6, 0.25, 0]);
	shadow.position.y = 0.002;
	car.add(shadow);
	car.rotation.y = rotation;
	scene.add(car);

	// Piso de showroom: un charco de luz cenital que se desvanece antes del borde del encuadre.
	const floorSize = Math.hypot(size.x, size.z) * 0.78;
	const floor = createGroundDisc(floorSize, floorSize, '255, 255, 255', [0.2, 0.07, 0]);
	floor.position.y = 0.001;
	scene.add(floor);

	const glassMaterials = new Set<MeshStandardMaterial>();
	const paintMaterials = new Set<MeshStandardMaterial>();
	model.traverse((object) => {
		if (!(object instanceof Mesh)) return;
		const materials = Array.isArray(object.material) ? object.material : [object.material];
		for (const material of materials) {
			if (material.name === TINTED_GLASS) glassMaterials.add(material as MeshStandardMaterial);
			if (material.name === PAINT) paintMaterials.add(material as MeshStandardMaterial);
		}
	});
	for (const material of paintMaterials) {
		material.map = null;
		material.color.set(PAINT_COLOR);
		material.metalness = PAINT_METALNESS;
		material.roughness = PAINT_ROUGHNESS;
		// El mapa de rugosidad/metal del modelo es de baja resolución y deja parches en las puertas.
		material.metalnessMap = null;
		material.roughnessMap = null;
		material.needsUpdate = true;
	}
	for (const material of glassMaterials) {
		material.transparent = true;
		material.depthWrite = false;
		// El vidrio original refleja el estudio como una mancha clara que tapa el tinte, sobre
		// todo en ángulos rasantes. `envMapIntensity` solo cuenta con un envMap propio (el de la
		// escena lo ignora), así que se le asigna el mismo entorno, casi apagado.
		material.metalness = 0;
		material.roughness = 0.1;
		material.envMap = scene.environment;
		material.envMapIntensity = 0.05;
	}

	// Reflejo sobre el piso: una copia del auto espejada bajo y = 0, casi transparente.
	// Se clona después de ajustar los materiales y lleva los suyos (no sigue al slider).
	const reflection = model.clone(true);
	reflection.traverse((object) => {
		if (!(object instanceof Mesh)) return;
		const fade = (material: MeshStandardMaterial) => {
			const copy = material.clone();
			copy.transparent = true;
			copy.opacity = REFLECTION_OPACITY;
			return copy;
		};
		object.material = Array.isArray(object.material) ? object.material.map(fade) : fade(object.material);
		object.renderOrder = -1;
	});
	// Pasada previa solo de profundidad: sin ella el reflejo deja ver el interior del auto
	// (asientos, ejes) a través de la carrocería semitransparente.
	const depthOnly = new MeshBasicMaterial({ colorWrite: false });
	const reflectionDepth = model.clone(true);
	reflectionDepth.traverse((object) => {
		if (object instanceof Mesh) object.material = depthOnly;
	});
	const mirror = new Group();
	mirror.scale.y = -1;
	mirror.add(reflectionDepth, reflection);
	car.add(mirror);

	const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
	const target = new Vector3(0, size.y * 0.42, 0);
	// Semiancho máximo que ocupa el auto al girar (su diagonal en planta).
	const halfWidth = Math.hypot(size.x, size.z) / 2;
	const halfHeight = size.y * 0.75;

	function resize() {
		const { clientWidth: width, clientHeight: height } = container;
		if (width === 0 || height === 0) return;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		// El ancho manda: FOV horizontal fijo, así el póster cuadrado coincide con el canvas
		// en cualquier proporción. Solo en escenarios muy anchos pasa a mandar la altura.
		const tan = Math.tan((FOV * Math.PI) / 360);
		let distance = (halfWidth / tan) * FIT_MARGIN;
		let tanVertical = tan / camera.aspect;
		if (distance * tanVertical < halfHeight * FIT_MARGIN) {
			tanVertical = tan;
			distance = (halfHeight / tan) * FIT_MARGIN;
		}
		camera.fov = (Math.atan(tanVertical) * 360) / Math.PI;
		camera.position.set(0, target.y + distance * CAMERA_LIFT, distance);
		camera.lookAt(target);
		camera.updateProjectionMatrix();
		render();
	}

	function render() {
		renderer.render(scene, camera);
	}

	function setTint(value: number) {
		const t = Math.min(1, Math.max(0, value));
		for (const material of glassMaterials) {
			material.color.lerpColors(GLASS_CLEAR, GLASS_DARK, t);
			// La opacidad sube rápido al inicio: el interior claro se nota mucho a través del vidrio.
			material.opacity = OPACITY_CLEAR + (OPACITY_DARK - OPACITY_CLEAR) * (1 - (1 - t) ** 2);
		}
	}

	// Arrastre: solo giro horizontal, sin zoom. El scroll vertical de la página sigue libre.
	const canvas = renderer.domElement;
	canvas.style.touchAction = 'pan-y';
	canvas.style.cursor = 'grab';
	let dragging = false;
	let lastX = 0;
	let resumeAt = 0;
	// Vaivén: oscila alrededor del ángulo donde quedó el auto tras el último arrastre.
	let swayCenter = rotation;
	let swayPhase = 0;

	canvas.addEventListener('pointerdown', (event) => {
		dragging = true;
		lastX = event.clientX;
		canvas.setPointerCapture(event.pointerId);
		canvas.style.cursor = 'grabbing';
	});
	canvas.addEventListener('pointermove', (event) => {
		if (!dragging) return;
		car.rotation.y += (event.clientX - lastX) * DRAG_SPEED;
		lastX = event.clientX;
	});
	const endDrag = () => {
		if (!dragging) return;
		dragging = false;
		resumeAt = performance.now() + RESUME_DELAY;
		swayCenter = car.rotation.y;
		swayPhase = 0;
		canvas.style.cursor = 'grab';
	};
	canvas.addEventListener('pointerup', endDrag);
	canvas.addEventListener('pointercancel', endDrag);

	let lastTime = 0;
	function tick(time: number) {
		const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
		lastTime = time;
		if (!dragging && time >= resumeAt) {
			swayPhase += SWAY_SPEED * delta;
			car.rotation.y = swayCenter + Math.sin(swayPhase) * SWAY_AMPLITUDE;
		}
		render();
	}

	function setRunning(running: boolean) {
		lastTime = 0;
		renderer.setAnimationLoop(running ? tick : null);
	}

	setTint(0);
	container.append(canvas);
	new ResizeObserver(resize).observe(container);
	resize();

	return { setTint, setRunning, render, canvas };
}
