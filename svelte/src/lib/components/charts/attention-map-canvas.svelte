<script>
	// https://nivo.rocks/heatmap/canvas/
	// https://github.com/unipept/unipept-visualizations/wiki/Heatmap
	import { Canvas, Layer } from 'svelte-canvas';
	import RectCanvas from '$components/charts/rect-canvas.svelte';
	RectCanvas;
	import { attentionColorScale } from '$lib/constants.js';
	import { scaleBand, range } from 'd3';

	export let data;
	export let i = 0;

	let canvas;

	$: width = canvas?.getCanvas().width;
	$: height = canvas?.getCanvas().height;

	const colorScale = attentionColorScale;

	$: xScale = scaleBand(range(data.length), [0, width]);
	$: yScale = scaleBand(range(data.length), [0, height]);
</script>

<Canvas bind:this={canvas}>
	<!-- When canvas is ready -->
	{#if width && height}
		<!-- Loop through matrix -->
		{#each data as _, i}
			{#each data as _, j}
				<!-- Only render lower triangular -->
				{#if i > j}
					{@const d = data[i][j]}
					<RectCanvas
						x={xScale(j)}
						y={yScale(i)}
						width={xScale.bandwidth()}
						height={yScale.bandwidth()}
						fill={colorScale(d)}
					/>
				{/if}
			{/each}
		{/each}
	{/if}
</Canvas>
