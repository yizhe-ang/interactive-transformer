import * as cola from 'webcola';
import * as d3 from 'd3';

export function colaLayout(graph) {
	// const nodes = graph.nodes.map(d => Object.create(d))
	const nodes = graph.nodes;

	// nodes.forEach((node) => {
	// node.height = 1;
	// node.width = 150;
	// node.height = node.width = 100
	// });

	// const index = new Map(nodes.map((d) => [d.id, d]));
	const index = new Map(nodes.map((d, i) => [d.id, i]));

	const constraints = graph.constraints.map((c) => {
		const output = { ...c };

		if (c.type == 'alignment') {
			output.offsets = c.offsets.map((o) => {
				return { ...o, node: index.get(o.node) };
			});
		} else {
			output.left = index.get(c.left);
			output.right = index.get(c.right);
		}

		return output;
	});

	// Process ids to index
	const groups = graph.groups.map((g) => {
		return {
			leaves: g.leaves.map((l) => {
				return index.get(l);
			})
		};
	});

	const edges = graph.edges.map((d) =>
		Object.assign(Object.create(d), {
			source: index.get(d.source),
			target: index.get(d.target)
		})
	);

	const layout = cola
		.d3adaptor(d3)
		.avoidOverlaps(true)
		.flowLayout('y', 80)
		// .symmetricDiffLinkLengths(6)
		.constraints(constraints)
		.nodes(nodes)
		.links(edges)
		.groups(groups)
		.start(10, 20, 20);

	return { layout, groups };
}
