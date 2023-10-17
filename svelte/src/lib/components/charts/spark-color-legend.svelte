<script>
  import ColorLegend from "$components/charts/color-legend.svelte";

  export let colorScale
</script>

<span class="inline-block relative w-[250px]"
	><ColorLegend
		color={colorScale}
		height={20}
		width={250}
		marginTop={0}
		marginBottom={0}
		classes="absolute top-0 rounded overflow-hidden"
	/>
	<slot />
</span>
