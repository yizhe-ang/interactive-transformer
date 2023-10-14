<script>
	import AttentionMaps from '$components/charts/attention-maps-webgl.svelte';
	import { Canvas } from '@threlte/core';
	import * as Card from '$ui/card';
	import {
		selectedLayer,
		selectedAttentionMapI,
		selectedTokenI,
		tokens,
		attentionMaps
	} from '$lib/stores.js';
	import AttentionMap from '$components/charts/attention-map-canvas.svelte';
	import { zoom, select } from 'd3';
	import { onMount } from 'svelte';

	let view;

	// onMount(() => {
	// 	const viewSelection = select(view);

	// 	viewSelection.call(
	// 		zoom().on('zoom', ({ transform, target }) => {
	// 			viewSelection.style(
	// 				'transform',
	// 				'translate(' + transform.x + 'px,' + transform.y + 'px) scale(' + transform.k + ')'
	// 			);
	// 			viewSelection.style('transform-origin', '0 0');
	// 		})
	// 	);
	// });
</script>

<div bind:this={view} class="w-full h-full bg-background relative">
<!-- <div bind:this={view} class="bg-background relative grid grid-cols-3 gap-11 p-36"> -->
	<Canvas colorManagementEnabled={false} frameloop="always">
		<AttentionMaps />
	</Canvas>

	<!-- {#await attentionMaps.load() then _}
		{#each $attentionMaps as data, i}
			<div class="h-96 w-96">
				<AttentionMap {data} {i} />
			</div>
		{/each}
	{/await} -->

	<!-- <div class="absolute left-0 right-0 bottom-0 grid place-content-center">
		<Card.Root class="pt-3">
			<Card.Content>
				<p>Layer</p>
				<p>Head {$selectedAttentionMapI}</p>
			</Card.Content>
		</Card.Root>
	</div> -->
</div>
