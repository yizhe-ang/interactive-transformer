<script>
	export let shape;
</script>

{#each shape as s, i}
	{s}
	{#if i < shape.length - 1}
		<span class="text-slate-300">x </span>
	{/if}
{/each}
