<script>
	import { Handle, Position } from '@xyflow/svelte';

	export let data;
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<div class="border-8">
	<div>{data.label}</div>
</div>
