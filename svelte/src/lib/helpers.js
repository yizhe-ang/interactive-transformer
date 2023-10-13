import { rgb } from 'd3';

export function isDarkColor(color) {
	function yiq(color) {
		const { r, g, b } = rgb(color);
		return (r * 299 + g * 587 + b * 114) / 1000 / 255; // returns values between 0 and 1
	}

	return yiq(color) < 0.6;
}
