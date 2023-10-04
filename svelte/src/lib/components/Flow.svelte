<script>
	import { writable } from 'svelte/store';
	import { SvelteFlow, Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/svelte';
	import { nodes, edges } from '$lib/graphs.js';

	// import '@xyflow/svelte/dist/base.css'
	import '@xyflow/svelte/dist/style.css';
</script>

<SvelteFlow {nodes} {edges} fitView on:nodeclick={(event) => console.log('on node click', event)}>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
