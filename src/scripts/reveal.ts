import { animate } from 'motion';

// Aparición al entrar en pantalla de todo `[data-reveal]` (patrón único, ver DESIGN.md).
// Los elementos que entran a la vez se escalonan en orden de documento.
const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (elements.length > 0 && !reduceMotion) {
	// Desde aquí el script se hace cargo: se apaga el failsafe de global.css.
	document.documentElement.classList.add('reveal-on');

	const observer = new IntersectionObserver(
		(entries) => {
			const entering = entries.filter((entry) => entry.isIntersecting);
			entering.forEach((entry, index) => {
				observer.unobserve(entry.target);
				animate(
					entry.target,
					{ opacity: [0, 1], y: [16, 0] },
					{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] },
				);
			});
		},
		{ threshold: 0.3 },
	);
	elements.forEach((element) => observer.observe(element));
}
