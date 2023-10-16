<script>
	import AttentionView from '$components/charts/attention-view.svelte';
	import LogitAttributionView from '$components/charts/logit-attribution-view.svelte';
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
</script>

<div class="w-full h-full bg-background relative">
	<Canvas colorManagementEnabled={false}>
		<!-- <AttentionView /> -->
		<LogitAttributionView />
	</Canvas>

	<!-- <div class="absolute left-0 right-0 bottom-0 grid place-content-center">
		<Card.Root class="pt-3">
			<Card.Content>
				<p>Layer</p>
				<p>Head {$selectedAttentionMapI}</p>
			</Card.Content>
		</Card.Root>
	</div> -->
</div>
