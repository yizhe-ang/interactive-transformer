import { writable } from 'svelte/store';
import dagre from 'dagre';

// FIXME: Nodes are activations, edges are parameters?
// FIXME: Use the third dimension for repeated components

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const xUnit = 100
const yUnit = 100

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({ rankdir: direction });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = isHorizontal ? 'left' : 'top';
		node.sourcePosition = isHorizontal ? 'right' : 'bottom';

		// We are shifting the dagre node position (anchor=center center) to the top left
		// so it matches the React Flow node anchor point (top left).
		node.position = {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2
		};

		return node;
	});

	return { nodes, edges };
};

const defaultNodeOptions = {
	// targetPosition: 'bottom',
	// sourcePosition: 'top',
	// position: { x: 0, y: 0 }
};

const defaultEdgeOptions = {
	markerEnd: {
		type: 'arrowclosed'
	}
};

function genEdge(sourceNode, targetNode, options) {
	return {
		...options,
		id: `${sourceNode.id}-${targetNode.id}`,
		source: sourceNode.id,
		target: targetNode.id
	};
}

// Embedding
const embeddingNodes = [
	{
		...defaultNodeOptions,
		id: 'tokens',
		type: 'input',
		data: { label: 'tokens' }
	},
	{
		...defaultNodeOptions,
		id: 'embedding',
		data: { label: 'embedding' }
	}
];

const embeddingEdges = [
	{
		...defaultEdgeOptions,
		id: 'tokens-embedding',
		source: 'tokens',
		target: 'embedding',
		label: 'lookup'
	}
];

// Residual stream
// const residualStreamNodes = [
// 	{
// 		id: 'residualPre',
// 		data: { label: 'residualPre', shape: ['seq', 'd_model'] }
// 	}
// ];

const residualPreNode = {
	id: 'residualPre',
	data: { label: 'residual pre', shape: ['seq', 'd_model'] },
  position: { x: 0, y: 0 }
};

// Attention head

function genAttentionHeadGraph(inputNode, id) {
	const groupNode = {
		id: `attentionHead_${id}`,
		type: 'group',
		data: { label: `attention head` },
		style: {
			width: 1000,
			height: 1000
		}
	};

	const defaultNodeOptions = {
		// parentNode: groupNode.id,
		// extent: 'parent'
	};

	const nodes = {
		// groupNode,
		wvNode: {
			...defaultNodeOptions,
			id: `W_V_${id}`,
			data: { label: 'W_V', shape: ['d_model', 'd_head'], type: 'parameters' },
      position: { x: xUnit * 1, y: yUnit * 1 }
		},
		wqNode: {
			...defaultNodeOptions,
			id: `W_Q_${id}`,
			data: { label: 'W_Q', shape: ['d_model', 'd_head'], type: 'parameters' },
      position: { x: xUnit * 2, y: yUnit * 1 }
		},
		wkNode: {
			...defaultNodeOptions,
			id: `W_K_${id}`,
			data: { label: 'W_K', shape: ['d_model', 'd_head'], type: 'parameters' },
      position: { x: xUnit * 3, y: yUnit * 1 }
		},
		vNode: {
			...defaultNodeOptions,
			id: `v_${id}`,
			data: { label: 'v', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
      position: { x: xUnit * 3, y: yUnit * 2 }
		},
		qNode: {
			...defaultNodeOptions,
			id: `q_${id}`,
			data: { label: 'q', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
      position: { x: xUnit * 2, y: yUnit * 2 }
		},
		kNode: {
			...defaultNodeOptions,
			id: `k_${id}`,
			data: { label: 'k', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
      position: { x: xUnit * 3, y: yUnit * 2 }
		},
		qKNode: {
			...defaultNodeOptions,
			id: `q~k_${id}`,
			data: { label: 'q~k', type: 'operation' }
		},
		attentionScoresNode: {
			...defaultNodeOptions,
			id: `attentionScores_${id}`,
			data: { label: 'attention scores', shape: ['n_head', 'seq_Q', 'seq_K'], type: 'activations' }
		},
		attentionPatternNode: {
			...defaultNodeOptions,
			id: `attentionPattern_${id}`,
			data: { label: 'attention pattern', shape: ['n_head', 'seq_Q', 'seq_K'], type: 'activations' }
		},
		vAttentionPatternNode: {
			...defaultNodeOptions,
			id: `v~attentionPattern_${id}`,
			data: { label: 'v~attention pattern', type: 'operation' }
		},
		zNode: {
			...defaultNodeOptions,
			id: `z_${id}`,
			data: { label: 'z', shape: ['seq', 'n_head', 'd_head'], type: 'activations' }
		},
		woNode: {
			...defaultNodeOptions,
			id: `W_O_${id}`,
			data: { label: 'W_O', shape: ['d_head', 'd_model'], type: 'parameters' }
		},
		resultNode: {
			...defaultNodeOptions,
			id: `result_${id}`,
			data: { label: 'result', shape: ['seq', 'n_head', 'd_model'], type: 'activations' }
		}
	};

	const edges = [
		genEdge(inputNode, nodes.wvNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(inputNode, nodes.wqNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(inputNode, nodes.wkNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(nodes.wvNode, nodes.vNode, { ...defaultEdgeOptions }),
		genEdge(nodes.wqNode, nodes.qNode, { ...defaultEdgeOptions }),
		genEdge(nodes.wkNode, nodes.kNode, { ...defaultEdgeOptions }),
		genEdge(nodes.qNode, nodes.qKNode, { ...defaultEdgeOptions }),
		genEdge(nodes.kNode, nodes.qKNode, { ...defaultEdgeOptions }),
		genEdge(nodes.qKNode, nodes.attentionScoresNode, { ...defaultEdgeOptions }),
		genEdge(nodes.attentionScoresNode, nodes.attentionPatternNode, {
			...defaultEdgeOptions,
			label: 'softmax'
		}),
		genEdge(nodes.vNode, nodes.vAttentionPatternNode, { ...defaultEdgeOptions }),
		genEdge(nodes.attentionPatternNode, nodes.vAttentionPatternNode, { ...defaultEdgeOptions }),
		genEdge(nodes.vAttentionPatternNode, nodes.zNode, { ...defaultEdgeOptions }),
		genEdge(nodes.zNode, nodes.woNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(nodes.woNode, nodes.resultNode, { ...defaultEdgeOptions })
	];

	return { nodes: Object.values(nodes), edges };
}

const { nodes: attentionHeadNodes, edges: attentionHeadEdges } = genAttentionHeadGraph(
	residualPreNode,
	1
);

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
	[residualPreNode, ...attentionHeadNodes],
	[...attentionHeadEdges]
);

// const layoutedNodes = [residualPreNode, ...attentionHeadNodes]
// const layoutedEdges = [...attentionHeadEdges]

export const nodes = writable(layoutedNodes);
export const edges = writable(layoutedEdges);
