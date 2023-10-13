<script>
	import * as Sheet from '$ui/sheet';
	import AttentionMaps from '$components/charts/attention-maps-webgl.svelte';
	import { Canvas } from '@threlte/core';
	import * as Card from '$ui/card';
	import { selectedLayer, selectedAttentionMapI, selectedTokenI, tokens } from '$lib/stores.js';

	// TODO: Make this resizeable

	let selected = {
		disabled: false,
		label: '0',
		value: 0
	};
	$: $selectedLayer = selected.value;
</script>

<!-- <Sheet.Root preventScroll={false} closeOnOutsideClick={false}>
	<Sheet.Trigger class="fixed">Open</Sheet.Trigger>
	<Sheet.Content side="right" class="resize-x">
		<div>
			<AttentionMaps />
		</div>
	</Sheet.Content>
</Sheet.Root> -->

<div class="w-[100%] h-[100%] bg-background relative">
	<!-- <Canvas>
		<AttentionMaps />
	</Canvas> -->


	<div class="absolute left-0 right-0 bottom-0 grid place-content-center">
		<Card.Root class="pt-3">
			<Card.Content>
				<p>Layer</p>
				<p>Head {$selectedAttentionMapI}</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
