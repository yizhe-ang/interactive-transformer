<script>
	import { Handle, Position } from '@xyflow/svelte';
	import * as Card from '$ui/card';
  import TensorShape from '$lib/components/tensor-shape.svelte';
  import SelectLayer from '$components/select-layer.svelte';

	export let data;
</script>

<Card.Root class="h-full bg-transparent">
	<Card.Header class="p-4 flex-row space-x-3 space-y-0 items-center justify-end">
		<Card.Title>{data.label}</Card.Title>
		<!-- {#if data.shape}
			<Card.Description><TensorShape shape={data.shape} /></Card.Description>
		{/if} -->
    <SelectLayer />
	</Card.Header>
</Card.Root>
