<script>
	import { getBezierPath, BaseEdge, EdgeLabelRenderer, useSvelteFlow } from '@xyflow/svelte';

	export let data;

	$: [path, labelX, labelY] = getBezierPath({
		sourceX: $$props.sourceX,
		sourceY: $$props.sourceY,
		targetX: $$props.targetX,
		targetY: $$props.targetY,
		sourcePosition: $$props.sourcePosition,
		targetPosition: $$props.targetPosition
	});
</script>

<BaseEdge {path} {labelX} {labelY} {...$$props} />

{#if data.label}
	<EdgeLabelRenderer>
		<span
			style:transform={`translate(-50%,-50%) translate(${labelX}px,${labelY}px)`}
			class="absolute bg-slate-200 px-2 py-1 rounded-full font-bold"
		>
			{data.label}
		</span>
	</EdgeLabelRenderer>
{/if}
