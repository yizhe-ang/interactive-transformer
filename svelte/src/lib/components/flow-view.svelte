<script>
	import '@xyflow/svelte/dist/style.css';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		useSvelteFlow,
		useNodes
	} from '@xyflow/svelte';
	import { transformerGraph } from '$lib/graphs.js';
	import Node from '$components/node.svelte';
	import LayerNode from '$components/layer-node.svelte';
	import { writable } from 'svelte/store';
	import { colaLayout } from '$lib/layout.js';

	const svelteFlow = useSvelteFlow();

	const nodeTypes = {
		node: Node,
    layerNode: LayerNode
	};

	const nodes = writable(transformerGraph.nodes);
	const edges = writable(transformerGraph.edges);

	$: nodesInitialized = $nodes.every((node) => node.width && node.height);
	$: if (nodesInitialized) {
		genlayout();
	}

	function genlayout() {
		const { layout, groups } = colaLayout({
			nodes: $nodes,
			edges: $edges,
			constraints: transformerGraph.constraints,
			groups: transformerGraph.groups
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
			svelteFlow.fitView($nodes);
		});

		layout.on('end', () => {
			const padding = 70;

			// TODO: Create group node
			groups.map((g) => {
				const node = {
					id: `attentionHead`,
					type: 'layerNode',
					draggable: false,
					selectable: false,
					position: { x: g.bounds.x - padding, y: g.bounds.y - padding },
					data: { label: `layer` },
					style: `width: ${g.bounds.width() + padding * 2}px; height: ${
						g.bounds.height() + padding * 2
					}px; pointer-events: none;`,
				};

				// $nodes.push(node);
				$nodes.unshift(node);
			});

			svelteFlow.fitView($nodes);
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
	<!-- <MiniMap /> -->
</SvelteFlow>
