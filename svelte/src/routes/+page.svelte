<script>
	import FlowView from '$components/flow-view.svelte';
	import DataView from '$components/data-view.svelte';
	import TextInput from '$components/text-input.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { tokenData, dataViewSize, selectedDataView, flowView } from '$lib/stores.js';
	import { fly } from 'svelte/transition';

	// async function test() {
	// 	const response = await fetch('http://localhost:8000/inference');
	// 	const output = await response.json();

	// 	return output;
	// }

	// const promise = test();

	let isSplitpanesReady = false;

	// TODO: Visualize loss for each token?

	// TODO: Direct logit attribution
</script>

<Splitpanes on:ready={() => (isSplitpanesReady = true)} class="fixed inset-0">
	<Pane>
		{#if isSplitpanesReady}
			<SvelteFlowProvider>
				<FlowView />
			</SvelteFlowProvider>
		{/if}
	</Pane>

	{#if $selectedDataView}
		<!-- <Pane bind:size={$dataViewSize}> -->
		<Pane size={50}>
			<DataView />
		</Pane>
	{/if}
</Splitpanes>

{#if $tokenData}
	<div
		transition:fly={{ y: -200, duration: 200 }}
		class="fixed left-0 right-0 grid place-content-center pointer-events-none"
	>
		<TextInput />
	</div>
{/if}
