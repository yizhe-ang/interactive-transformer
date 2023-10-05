import { writable } from 'svelte/store';
import dagre from 'dagre';

// FIXME: Nodes are activations, edges are parameters?
// FIXME: Use the third dimension for repeated components

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const xUnit = 200;
const yUnit = 100;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
	const nodeWidth = 172;
	const nodeHeight = 36;

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
		position: { x: inputNode.position.x + xUnit * 0.5, y: inputNode.position.y + yUnit * 1 },
		style: `width: ${xUnit * 3.5}px; height: ${yUnit * 9.5}px;`
	};

	const defaultNodeOptions = {
		parentNode: groupNode.id,
		extent: 'parent',
    type: "node"
	};

	const wvNode = {
		...defaultNodeOptions,
		id: `W_V_${id}`,
		data: { label: 'W_V', shape: ['d_model', 'd_head'], type: 'parameters' },
		position: { x: xUnit * 0.4, y: yUnit * 0.5 }
	};
	const wqNode = {
		...defaultNodeOptions,
		id: `W_Q_${id}`,
		data: { label: 'W_Q', shape: ['d_model', 'd_head'], type: 'parameters' },
		position: { x: wvNode.position.x + xUnit, y: wvNode.position.y }
	};
	const wkNode = {
		...defaultNodeOptions,
		id: `W_K_${id}`,
		data: { label: 'W_K', shape: ['d_model', 'd_head'], type: 'parameters' },
		position: { x: wqNode.position.x + xUnit, y: wvNode.position.y }
	};
	const vNode = {
		...defaultNodeOptions,
		id: `v_${id}`,
		data: { label: 'v', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
		position: { x: wvNode.position.x, y: wvNode.position.y + yUnit }
	};
	const qNode = {
		...defaultNodeOptions,
		id: `q_${id}`,
		data: { label: 'q', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
		position: { x: wqNode.position.x, y: wqNode.position.y + yUnit }
	};
	const kNode = {
		...defaultNodeOptions,
		id: `k_${id}`,
		data: { label: 'k', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
		position: { x: wkNode.position.x, y: wkNode.position.y + yUnit }
	};
	const qKNode = {
		...defaultNodeOptions,
		id: `q~k_${id}`,
		data: { label: 'q~k', type: 'operation' },
		position: { x: (qNode.position.x + kNode.position.x) / 2, y: qNode.position.y + yUnit }
	};
	const attentionScoresNode = {
		...defaultNodeOptions,
		id: `attentionScores_${id}`,
		data: { label: 'attention scores', shape: ['n_head', 'seq_Q', 'seq_K'], type: 'activations' },
		position: { x: qKNode.position.x, y: qKNode.position.y + yUnit }
	};
	const attentionPatternNode = {
		...defaultNodeOptions,
		id: `attentionPattern_${id}`,
		data: { label: 'attention pattern', shape: ['n_head', 'seq_Q', 'seq_K'], type: 'activations' },
		position: { x: attentionScoresNode.position.x, y: attentionScoresNode.position.y + yUnit }
	};
	const vAttentionPatternNode = {
		...defaultNodeOptions,
		id: `v~attentionPattern_${id}`,
		data: { label: 'v~attention pattern', type: 'operation' },
		position: { x: wqNode.position.x, y: attentionPatternNode.position.y + yUnit }
	};
	const zNode = {
		...defaultNodeOptions,
		id: `z_${id}`,
		data: { label: 'z', shape: ['seq', 'n_head', 'd_head'], type: 'activations' },
		position: { x: vAttentionPatternNode.position.x, y: vAttentionPatternNode.position.y + yUnit }
	};
	const woNode = {
		...defaultNodeOptions,
		id: `W_O_${id}`,
		data: { label: 'W_O', shape: ['d_head', 'd_model'], type: 'parameters' },
		position: { x: zNode.position.x, y: zNode.position.y + yUnit }
	};
	const resultNode = {
		...defaultNodeOptions,
		id: `result_${id}`,
		data: { label: 'result', shape: ['seq', 'n_head', 'd_model'], type: 'activations' },
		position: { x: woNode.position.x, y: woNode.position.y + yUnit }
	};

	const edges = [
		genEdge(inputNode, wvNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(inputNode, wqNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(inputNode, wkNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(wvNode, vNode, { ...defaultEdgeOptions }),
		genEdge(wqNode, qNode, { ...defaultEdgeOptions }),
		genEdge(wkNode, kNode, { ...defaultEdgeOptions }),
		genEdge(qNode, qKNode, { ...defaultEdgeOptions }),
		genEdge(kNode, qKNode, { ...defaultEdgeOptions }),
		genEdge(qKNode, attentionScoresNode, { ...defaultEdgeOptions }),
		genEdge(attentionScoresNode, attentionPatternNode, {
			...defaultEdgeOptions,
			label: 'softmax'
		}),
		genEdge(vNode, vAttentionPatternNode, { ...defaultEdgeOptions }),
		genEdge(attentionPatternNode, vAttentionPatternNode, { ...defaultEdgeOptions }),
		genEdge(vAttentionPatternNode, zNode, { ...defaultEdgeOptions }),
		genEdge(zNode, woNode, { ...defaultEdgeOptions, label: '@' }),
		genEdge(woNode, resultNode, { ...defaultEdgeOptions })
	];

	const nodes = [
		groupNode,
		wvNode,
		wqNode,
		wkNode,
		vNode,
		qNode,
		kNode,
		qKNode,
		attentionScoresNode,
		attentionPatternNode,
		vAttentionPatternNode,
		zNode,
		woNode,
		resultNode
	];

	return { nodes, edges };
}

const { nodes: attentionHeadNodes, edges: attentionHeadEdges } = genAttentionHeadGraph(
	residualPreNode,
	1
);

// const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
// 	[residualPreNode, ...attentionHeadNodes],
// 	[...attentionHeadEdges]
// );

const layoutedNodes = [residualPreNode, ...attentionHeadNodes];
const layoutedEdges = [...attentionHeadEdges];

export const nodes = writable(layoutedNodes);
export const edges = writable(layoutedEdges);
