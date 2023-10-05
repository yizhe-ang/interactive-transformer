<script>
	import { writable } from 'svelte/store';
	import { SvelteFlow, Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/svelte';
	import { nodes, edges } from '$lib/graphs.js';
  import Node from './Node.svelte';

	// import '@xyflow/svelte/dist/base.css'
	import '@xyflow/svelte/dist/style.css';

  const nodeTypes = {
    node: Node
  }
</script>

<SvelteFlow {nodes} {edges} {nodeTypes} fitView on:nodeclick={(event) => console.log('on node click', event)}>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
