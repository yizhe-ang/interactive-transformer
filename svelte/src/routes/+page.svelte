<script>
	import FlowView from '$components/flow-view.svelte';
	import DataView from '$components/data-view.svelte';
	import TextInput from '$components/text-input.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import { tokenData } from '$lib/stores.js';
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

	<Pane size={50}>
		<DataView />
	</Pane>
</Splitpanes>

<div class="fixed left-0 right-0 grid place-content-center pointer-events-none">
	{#if $tokenData}
		<TextInput />
	{/if}
</div>
