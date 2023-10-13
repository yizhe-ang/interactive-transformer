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

const defaultEdgeOptions = {
	markerEnd: {
		type: 'arrowclosed'
	},
  zIndex: 1
};

function genEdge(sourceNode, targetNode, options) {
	return {
		...options,
		id: `${sourceNode.id}-${targetNode.id}`,
		source: sourceNode.id,
		target: targetNode.id
	};
}

const defaultNodeOptions = {
	type: 'node',
	position: { x: 0, y: 0 }
};

const inputNode = {
	...defaultNodeOptions,
	id: 'input',
	data: { label: 'input text' }
};

const embeddingNode = {
	...defaultNodeOptions,
	id: 'embedding',
	data: { label: 'embedding', shape: ['seq', 'd_model'], type: 'activations' }
};

const inputNodes = [inputNode, embeddingNode];

const inputEdges = [genEdge(inputNode, embeddingNode, { ...defaultEdgeOptions })];

const residualPreNode = {
	...defaultNodeOptions,
	id: 'residualPre',
	data: { label: 'residual pre', shape: ['seq', 'd_model'], type: 'activations' }
};

const residualPostNode = {
	...defaultNodeOptions,
	id: 'residualPost',
	data: { label: 'residual post', shape: ['seq', 'd_model'], type: 'activations' }
};

// Attention head

function genAttentionHeadGraph(id, inputNode, outputNode) {
	const defaultNodeOptions = {
		// parentNode: groupNode.id,
		// extent: 'parent',
		type: 'node',
		class: 'nodrag',
		position: { x: 0, y: 0 }
	};

	const groupNode = {
		...defaultNodeOptions,
		id: `attentionHead_${id}`,
		// type: 'group',
		data: { label: `attention head` }
		// position: { x: inputNode.position.x + xUnit * 0.5, y: inputNode.position.y + yUnit * 1 },
		// style: `width: ${xUnit * 3.5}px; height: ${yUnit * 9.5}px;`
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
	// const sumHeadsNode = {
	// 	...defaultNodeOptions,
	// 	id: `sumHeads_${id}`,
	// 	data: { label: 'sum heads', type: 'operation' }
	// };
	const attentionOutNode = {
		...defaultNodeOptions,
		id: `attentionOut_${id}`,
		data: { label: 'attention out', shape: ['seq', 'd_model'], type: 'activations' }
	};
	const residualPreAddAttentionOutNode = {
		...defaultNodeOptions,
		id: `residualPre+attentionOut_${id}`,
		data: { label: '+', type: 'operation' }
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
		genEdge(woNode, resultNode, { ...defaultEdgeOptions }),
		// genEdge(resultNode, sumHeadsNode, { ...defaultEdgeOptions })
		genEdge(resultNode, attentionOutNode, { ...defaultEdgeOptions }),
		genEdge(inputNode, residualPreAddAttentionOutNode, { ...defaultEdgeOptions }),
		genEdge(attentionOutNode, residualPreAddAttentionOutNode, { ...defaultEdgeOptions }),
		genEdge(residualPreAddAttentionOutNode, outputNode, { ...defaultEdgeOptions })
	];

	const nodes = [
		// groupNode,
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
		resultNode,
		attentionOutNode,
		residualPreAddAttentionOutNode
	];

	const groups = [
		{
			leaves: [
				wvNode.id,
				wqNode.id,
				wkNode.id,
				vNode.id,
				qNode.id,
				kNode.id,
				qKNode.id,
				attentionScoresNode.id,
				attentionPatternNode.id,
				vAttentionPatternNode.id,
				zNode.id,
				woNode.id,
				resultNode.id,
				attentionOutNode.id
				// residualPreAddAttentionOutNode
			]
		}
	];

	const constraints = [
		{
			type: 'alignment',
			axis: 'y',
			offsets: [
				{ node: wvNode.id, offset: 0 },
				{ node: wqNode.id, offset: 0 },
				{ node: wkNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'y',
			offsets: [
				{ node: vNode.id, offset: 0 },
				{ node: qNode.id, offset: 0 },
				{ node: kNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: wvNode.id, offset: 0 },
				{ node: vNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: wqNode.id, offset: 0 },
				{ node: qNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: wkNode.id, offset: 0 },
				{ node: kNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: qKNode.id, offset: 0 },
				{ node: attentionScoresNode.id, offset: 0 },
				{ node: attentionPatternNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: vAttentionPatternNode.id, offset: 0 },
				{ node: zNode.id, offset: 0 },
				{ node: woNode.id, offset: 0 },
				{ node: resultNode.id, offset: 0 },
				{ node: attentionOutNode.id, offset: 0 }
			]
		},
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: inputNode.id, offset: 0 },
				{ node: outputNode.id, offset: 0 },
				{ node: residualPreAddAttentionOutNode.id, offset: 0 }
			]
		},
		{
			axis: 'x',
			left: inputNode.id,
			right: wqNode.id,
			gap: 200
		},
		{
			axis: 'x',
			left: inputNode.id,
			right: wkNode.id,
			gap: 300
		},
		{
			axis: 'x',
			left: inputNode.id,
			right: wvNode.id,
			gap: 100
		},
		{
			axis: 'y',
			left: inputNode.id,
			right: wqNode.id,
			gap: 150
		},
	];

	return { nodes, edges, constraints, groups };
}

const {
	nodes: attentionHeadNodes,
	edges: attentionHeadEdges,
	constraints: attentionConstraints,
	groups: attentionGroups
} = genAttentionHeadGraph(1, embeddingNode, residualPostNode);

// const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
// 	[residualPreNode, ...attentionHeadNodes],
// 	[...attentionHeadEdges]
// );
// const { nodes: layoutedNodes, edges: layoutedEdges } = colaLayout(
// 	[residualPreNode, ...attentionHeadNodes],
// 	[...attentionHeadEdges]
// );

export const transformerGraph = {
	nodes: [...inputNodes, residualPostNode, ...attentionHeadNodes],
	edges: [...inputEdges, ...attentionHeadEdges],
	groups: attentionGroups,
	constraints: [
		{
			type: 'alignment',
			axis: 'x',
			offsets: [
				{ node: inputNode.id, offset: 0 },
				{ node: embeddingNode.id, offset: 0 }
			]
		},
		...attentionConstraints
	]
};
