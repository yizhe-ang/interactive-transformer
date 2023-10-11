<script>
	import * as Sheet from '$ui/sheet';
	import AttentionMaps from '$components/charts/attention-maps.svelte';
	import { Canvas } from '@threlte/core';

	// TODO: Make this resizeable
</script>

<!-- <Sheet.Root preventScroll={false} closeOnOutsideClick={false}>
	<Sheet.Trigger class="fixed">Open</Sheet.Trigger>
	<Sheet.Content side="right" class="resize-x">
		<div>
			<AttentionMaps />
		</div>
	</Sheet.Content>
</Sheet.Root> -->

<div class="w-[100%] h-[100%] bg-background">
	<Canvas>
		<AttentionMaps />
	</Canvas>
</div>
