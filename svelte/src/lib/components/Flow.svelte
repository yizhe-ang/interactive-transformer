<script>
	import '@xyflow/svelte/dist/style.css';

	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		useSvelteFlow
	} from '@xyflow/svelte';
	import { transformerGraph } from '$lib/graphs.js';
	import Node from './Node.svelte';
	import { writable } from 'svelte/store';
	import { colaLayout } from '$lib/layout.js';

	const { fitView } = useSvelteFlow();

	const nodeTypes = {
		node: Node
	};

	const nodes = writable(transformerGraph.nodes);
	const edges = writable(transformerGraph.edges);

	$: nodesInitialized = $nodes.every((node) => node.width && node.height);
	$: if (nodesInitialized) {
		genlayout();
	}

	function genlayout() {
		const layout = colaLayout({
			nodes: $nodes,
			edges: $edges,
			constraints: transformerGraph.constraints
		});

		layout.on('tick', () => {
			$nodes.forEach((node) => {
				node.position = {
          // Center nodes
					x: node.x - node.width / 2,
					y: node.y - node.height / 2
				};
			});

			$nodes = $nodes;

      // FIXME:
			fitView($nodes);
		});
	}
</script>

<SvelteFlow
	{nodes}
	{edges}
	{nodeTypes}
	fitView
	on:nodeclick={(event) => console.log(event.detail.node)}
>
	<Controls />
	<Background variant={BackgroundVariant.Dots} />
	<MiniMap />
</SvelteFlow>
