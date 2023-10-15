import { rgb } from 'd3';
import { createTransition } from '@threlte/extras';
import { cubicIn, cubicOut } from 'svelte/easing';

export function isDarkColor(color) {
	function yiq(color) {
		const { r, g, b } = rgb(color);
		return (r * 299 + g * 587 + b * 114) / 1000 / 255; // returns values between 0 and 1
	}

	return yiq(color) < 0.6;
}

export function getColumns(arr, indices) {
	return arr.map((row) => indices.map((i) => row[i]));
}

// export const opacityTransition = (delay = 0) => {
// 	return createTransition((ref, { direction }) => {
// 		ref.transparent = true;
// 		return {
// 			tick(t) {
// 				ref.opacity = t;
// 			},
// 			delay: delay + (direction === 'in' ? 200 : 0),
// 			duration: 200,
// 			easing: direction === 'in' ? cubicOut : cubicIn
// 		};
// 	});
// };

// TODO: More complex animation
// Animating each point one after the other
// Have to use a shader? See MathBox
export const opacityTransition = (i = 0) => {
	return createTransition((ref, { direction }) => {
		ref.transparent = true;
		return {
			tick(t) {
				ref.uniforms.uOpacity.value = t;
			},
			delay: i * 70 + (direction === 'in' ? 200 : 0),
			duration: 200,
			easing: direction === 'in' ? cubicOut : cubicIn
		};
	});
};
