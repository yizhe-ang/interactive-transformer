<script>
	import { Handle, Position } from '@xyflow/svelte';
	import * as Card from '$ui/card';
  import TensorShape from '$lib/components/tensor-shape.svelte';

	export let data;
	export let xPos;
	export let yPos;
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<Card.Root>
	<Card.Header class="p-4 flex-row space-x-3 space-y-0 items-start">
		<Card.Title>{data.label}</Card.Title>
		{#if data.shape}
			<Card.Description><TensorShape shape={data.shape} /></Card.Description>
		{/if}
	</Card.Header>
</Card.Root>
