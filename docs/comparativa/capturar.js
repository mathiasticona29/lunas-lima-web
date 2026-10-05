// Capturas por sección y medidas de la landing, para comparar antes/después del rediseño.
// Se ejecuta con el MCP de Playwright (browser_run_code_unsafe, filename) con el servidor
// de desarrollo en http://localhost:4321. Cambiar FASE a 'despues' para la segunda pasada.
async (page) => {
	const FASE = 'antes';
	const URL = 'http://localhost:4321/';
	const VIEWPORTS = [
		{ width: 375, height: 812 },
		{ width: 768, height: 1024 },
		{ width: 1440, height: 900 },
	];

	// Recorre la página para disparar todos los `data-reveal` y vuelve arriba.
	const revealAll = async () => {
		await page.evaluate(async () => {
			const step = Math.round(window.innerHeight * 0.6);
			for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
				window.scrollTo({ top: y, behavior: 'instant' });
				await new Promise((r) => setTimeout(r, 120));
			}
			window.scrollTo({ top: 0, behavior: 'instant' });
		});
		await page.waitForTimeout(1500);
	};

	const measure = () =>
		page.evaluate(async () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const doc = document.documentElement;

			const shown = (el) => {
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				return (
					r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' &&
					Number(cs.opacity) > 0.05 && cs.pointerEvents !== 'none'
				);
			};
			const inViewport = (el) => {
				const r = el.getBoundingClientRect();
				return shown(el) && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
			};

			// CTA de WhatsApp por pantalla de scroll.
			const wa = [...document.querySelectorAll('a[href*="wa.me"]')];
			const float = (el) => getComputedStyle(el).position === 'fixed' || !!el.closest('[data-wa-float]');
			const screens = Math.ceil(doc.scrollHeight / vh);
			let waPrimerPantallazo = 0;
			let pantallasSinCta = 0;
			let pantallasSinCtaDeSeccion = 0;
			for (let i = 0; i < screens; i++) {
				window.scrollTo({ top: i * vh, behavior: 'instant' });
				await new Promise((r) => setTimeout(r, 450));
				const visibles = wa.filter(inViewport);
				if (i === 0) waPrimerPantallazo = visibles.length;
				if (visibles.length === 0) pantallasSinCta++;
				if (visibles.filter((el) => !float(el) && !el.closest('header')).length === 0) pantallasSinCtaDeSeccion++;
			}
			window.scrollTo({ top: 0, behavior: 'instant' });
			await new Promise((r) => setTimeout(r, 300));

			// Áreas táctiles menores de 44 × 44 px (se excluyen los enlaces dentro de un texto).
			const label = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
			const tactilesPequenos = [...document.querySelectorAll('a[href], button, summary, input, [role="button"]')]
				.filter((el) => {
					const cs = getComputedStyle(el);
					const r = el.getBoundingClientRect();
					if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') return false;
					if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, dd')) return false;
					return r.width < 44 || r.height < 44;
				})
				.map((el) => {
					const r = el.getBoundingClientRect();
					return `${label(el)} (${Math.round(r.width)}×${Math.round(r.height)})`;
				});

			// Contraste AA de cada elemento con texto propio.
			const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
			const rgba = (color) => {
				ctx.clearRect(0, 0, 1, 1);
				ctx.fillStyle = '#000';
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, 1, 1);
				const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
				return [r, g, b, a / 255];
			};
			const over = (top, base) => top.slice(0, 3).map((c, i) => c * top[3] + base[i] * (1 - top[3]));
			const lum = (c) => {
				const [r, g, b] = c.map((v) => {
					const s = v / 255;
					return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
				});
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			};
			// Fondo efectivo: null si hay una imagen o degradado detrás (no medible aquí).
			const background = (el) => {
				const layers = [];
				for (let n = el; n; n = n.parentElement) {
					const cs = getComputedStyle(n);
					if (cs.backgroundImage !== 'none') return null;
					const c = rgba(cs.backgroundColor);
					if (c[3] > 0) layers.push(c);
					if (c[3] === 1) break;
				}
				return layers.reverse().reduce((base, c) => over(c, base), [255, 255, 255]);
			};
			const contrasteBajo = [];
			let textosMedidos = 0;
			let textosNoMedibles = 0;
			for (const el of document.querySelectorAll('body *')) {
				const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
				if (!propio || el.closest('.sr-only, [hidden], script, style, noscript')) continue;
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') continue;
				const bg = background(el);
				if (!bg) {
					textosNoMedibles++;
					continue;
				}
				textosMedidos++;
				const fg = over(rgba(cs.color), bg);
				const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
				const ratio = (a + 0.05) / (b + 0.05);
				const px = parseFloat(cs.fontSize);
				const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
				if (ratio < (grande ? 3 : 4.5)) contrasteBajo.push(`${label(el)} (${ratio.toFixed(2)}:1, ${px}px)`);
			}

			// Secciones: alto y, en escritorio, si caben bajo el navbar tras el salto por ancla.
			const navbarH = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
			const secciones = [...document.querySelectorAll('main > section, main > * > section')].map((s, i) => {
				const alto = Math.round(s.getBoundingClientRect().height);
				return { id: s.id || (i === 0 ? 'hero' : `seccion-${i}`), alto, cabeEnPantalla: alto <= Math.ceil(vh - navbarH) || i === 0 };
			});

			return {
				viewport: `${vw}×${vh}`,
				altoPagina: doc.scrollHeight,
				pantallasDeScroll: +(doc.scrollHeight / vh).toFixed(1),
				desbordeHorizontal: doc.scrollWidth > vw,
				ctaWhatsApp: wa.length,
				waPrimerPantallazo,
				pantallasSinCta,
				pantallasSinCtaDeSeccion,
				tactilesPequenos,
				textosMedidos,
				textosNoMedibles,
				contrasteBajo,
				secciones,
			};
		});

	const medidas = [];
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	for (const vp of VIEWPORTS) {
		await page.setViewportSize(vp);
		await page.goto(URL, { waitUntil: 'networkidle' });
		// La barra de desarrollo de Astro es fija y se colaría en las capturas. La barra de
		// scroll clásica del navegador de escritorio resta 15px de ancho útil (375 → 360) y
		// desaparece al capturar, lo que descuadra los recortes: se quita para medir y capturar
		// con el ancho real, como en un móvil.
		await page.addStyleTag({
			content: 'astro-dev-toolbar { display: none !important; } html { scrollbar-width: none; }',
		});
		await page.waitForTimeout(2500);
		await revealAll();

		const cajas = await page.evaluate(() => {
			const caja = (el, nombre) => {
				const r = el.getBoundingClientRect();
				return { nombre, x: 0, y: Math.round(r.top + window.scrollY), width: window.innerWidth, height: Math.round(r.height) };
			};
			const secciones = [...document.querySelectorAll('main > section, main > * > section')];
			return [
				...secciones.map((s, i) => caja(s, s.id || (i === 0 ? 'hero' : `seccion-${i}`))),
				caja(document.querySelector('footer'), 'footer'),
			];
		});
		for (const { nombre, ...clip } of cajas) {
			await page.screenshot({
				path: `docs/comparativa/${FASE}/${nombre}-${vp.width}.png`,
				fullPage: true,
				clip,
				scale: 'css',
			});
		}
		medidas.push(await measure());
	}
	return medidas;
}
