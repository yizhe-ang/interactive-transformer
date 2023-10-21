<script>
	import { Handle, Position } from '@xyflow/svelte';
	import * as Card from '$ui/card';
	import TensorShape from '$lib/components/tensor-shape.svelte';
	import { Toggle } from '$ui/toggle';
  import { selectedDataView } from "$lib/stores.js"

	export let data;

  // const toggleClasses = `toggle shadow-md hover:shadow-xl transition cursor-pointer h-auto w-auto p-0 shadow-${shadowColor[data.type]} hover:shadow-${shadowColor[data.type]} data-[state=on]:shadow-xl data-[state=on]:shadow-${shadowColor[data.type]}`
  const toggleClasses = `toggle shadow-md hover:shadow-xl transition cursor-pointer h-auto w-auto p-0 data-[state=on]:shadow-xl`
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />

<Toggle shadow={data.type} class={toggleClasses}
  on:click={(e) => {
    $selectedDataView = "attention"
  }}
>
	<div>
		<Card.Root class="h-full">
			<Card.Header class="p-4 flex-row space-x-3 space-y-0 items-start">
				<Card.Title>{data.label}</Card.Title>
				{#if data.shape}
					<Card.Description><TensorShape shape={data.shape} /></Card.Description>
				{/if}
			</Card.Header>
		</Card.Root>
	</div>
</Toggle>
