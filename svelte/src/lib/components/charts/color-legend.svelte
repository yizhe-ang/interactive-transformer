<script>
	// Copyright 2021, Observable Inc.
	// Released under the ISC license.
	// https://observablehq.com/@d3/color-legend
	import { onMount } from 'svelte';
	import { select } from 'd3-selection';
	import { quantile, range } from 'd3-array';
	import { interpolate, interpolateRound, quantize } from 'd3-interpolate';
	import { format } from 'd3-format';
	import { scaleLinear, scaleBand } from 'd3-scale';
	import { axisBottom } from 'd3-axis';

	export let color;
	export let title;
	export let tickSize = 6;
	export let width = 320;
	export let height = 44 + tickSize;
	export let marginTop = 18;
	export let marginRight = 0;
	export let marginBottom = 16 + tickSize;
	export let marginLeft = 0;
	export let ticks = width / 64;
	export let tickFormat;
	export let tickValues;
	export let vertical = false;
	export let removeAnnotations = false;
	export let clipPath = false;
	export let classes = '';

	color = color.copy();

	let svgElement;
	let svg;

	onMount(() => {
		svg = select(svgElement);
		const target = svg.append('g');

		init(target);
	});

	function ramp(color, n = 256) {
		const canvas = document.createElement('canvas');
		canvas.width = n;
		canvas.height = 1;
		const context = canvas.getContext('2d');
		for (let i = 0; i < n; ++i) {
			context.fillStyle = color(i / (n - 1));
			// context.fillRect(i, 0, 1, 1)
			context.fillRect(i, 0, 1, 1);
		}
		return canvas;
	}

	function init(target) {
		let tickAdjust = (g) => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);
		let x;

		if (vertical) {
			const colorRange = color.range();
			color.range(colorRange.reverse());
			target.style('transform', 'rotate(90deg) translate(0, -100%)');
		}

		// Add clip path
		if (clipPath) {
			svg
				.append('defs')
				.append('clipPath')
				.attr('id', 'color-legend-mask')
				.append('rect')
				.attr('x', marginLeft)
				.attr('y', marginTop)
				.attr('width', width - marginLeft - marginRight)
				.attr('height', height - marginTop - marginBottom)
				.attr('fill', 'black');
			// .style('transform', 'scaleX(0)')
			// .style('transform-origin', 'center')
		}

		// Continuous
		if (color.interpolate) {
			const n = Math.min(color.domain().length, color.range().length);

			x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n));

			target
				.append('image')
				.attr('x', marginLeft)
				.attr('y', marginTop)
				.attr('width', width - marginLeft - marginRight)
				.attr('height', height - marginTop - marginBottom)
				.attr('preserveAspectRatio', 'none')
				.attr('xlink:href', ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL());
		}

		// Sequential
		else if (color.interpolator) {
			x = Object.assign(
				color.copy().interpolator(interpolateRound(marginLeft, width - marginRight)),
				{
					range() {
						return [marginLeft, width - marginRight];
					}
				}
			);

			target
				.append('image')
				.attr('x', marginLeft)
				.attr('y', marginTop)
				.attr('width', width - marginLeft - marginRight)
				.attr('height', height - marginTop - marginBottom)
				.attr('preserveAspectRatio', 'none')
				.attr('xlink:href', ramp(color.interpolator()).toDataURL())
				.style('clip-path', clipPath ? 'url(#color-legend-mask)' : null);

			// scaleSequentialQuantile doesn’t implement ticks or tickFormat.
			if (!x.ticks) {
				if (tickValues === undefined) {
					const n = Math.round(ticks + 1);
					tickValues = range(n).map((i) => quantile(color.domain(), i / (n - 1)));
				}
				if (typeof tickFormat !== 'function') {
					tickFormat = format(tickFormat === undefined ? ',f' : tickFormat);
				}
			}
		}

		// Threshold
		else if (color.invertExtent) {
			const thresholds = color.thresholds
				? color.thresholds() // scaleQuantize
				: color.quantiles
				? color.quantiles() // scaleQuantile
				: color.domain(); // scaleThreshold

			const thresholdFormat =
				tickFormat === undefined
					? (d) => d
					: typeof tickFormat === 'string'
					? format(tickFormat)
					: tickFormat;

			x = scaleLinear()
				.domain([-1, color.range().length - 1])
				.rangeRound([marginLeft, width - marginRight]);

			target
				.append('g')
				.selectAll('rect')
				.data(color.range())
				.join('rect')
				.attr('x', (d, i) => x(i - 1))
				.attr('y', marginTop)
				.attr('width', (d, i) => x(i) - x(i - 1))
				.attr('height', height - marginTop - marginBottom)
				.attr('fill', (d) => d);

			tickValues = range(thresholds.length);
			tickFormat = (i) => thresholdFormat(thresholds[i], i);
		}

		// Ordinal
		else {
			x = scaleBand()
				.domain(color.domain())
				.rangeRound([marginLeft, width - marginRight]);

			target
				.append('g')
				.selectAll('rect')
				.data(color.domain())
				.join('rect')
				.attr('x', x)
				.attr('y', marginTop)
				.attr('width', Math.max(0, x.bandwidth() - 1))
				.attr('height', height - marginTop - marginBottom)
				.attr('fill', color);

			tickAdjust = () => {};
		}

		if (!removeAnnotations) {
			target
				.append('g')
				.attr('transform', `translate(0,${height - marginBottom})`)
				.call(
					axisBottom(x)
						.ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
						.tickFormat(typeof tickFormat === 'function' ? tickFormat : undefined)
						.tickSize(tickSize)
						.tickValues(tickValues)
				)
				.call(tickAdjust)
				.call((g) => g.select('.domain').remove())
				.call((g) =>
					g
						.append('text')
						.attr('x', marginLeft)
						.attr('y', marginTop + marginBottom - height - 6)
						.attr('fill', 'currentColor')
						.attr('text-anchor', 'start')
						.attr('font-weight', 'bold')
						.attr('class', 'title')
						.text(title)
				);
		}
	}
</script>

<div class={classes}>
	<svg bind:this={svgElement} {width} {height} viewBox={[0, 0, width, height]} />
</div>

<style lang="postcss">
	svg {
		display: block;
		overflow: visible;

		&:global(text) {
			font-size: px-to-rem(12);
			font-weight: 900;
			text-shadow: none;
			stroke: black;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-width: 5;
			paint-order: stroke;
		}
	}
</style>
