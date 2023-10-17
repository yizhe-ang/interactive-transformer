<script>
	import { T, useThrelte } from '@threlte/core';
	import { Align, OrbitControls, interactivity, transitions } from '@threlte/extras';
	import * as THREE from 'three';
	import { Flex, Box } from '@threlte/flex';
	import { logitAttributionData, modelConfig, tokenData } from '$lib/stores.js';
	import Heatmap from '$components/charts/heatmap.svelte';
	import { getColumns } from '$lib/helpers.js';
	import { range, extent, max } from 'd3';
	import { logitAttributionColorScale } from '$lib/constants.js';
	import { getContext, onMount, setContext } from 'svelte';

	const cameraControls = getContext('cameraControls');

	$: data = $logitAttributionData;

	let dataExtent;
	$: if (data) dataExtent = max(extent(data.flat()), (d) => Math.abs(d));
	$: colorScale = logitAttributionColorScale.domain([-dataExtent, 0, dataExtent]);

	setContext('selectedData', tokenData);

	onMount(() => {
		logitAttributionData.load().then((data) => {
			$tokenData = getColumns(data, [0])
				.flat()
				.map((d) => colorScale(d));
		});
	});

	$: padding = data?.length / 10;
</script>

{#await logitAttributionData.load() then _}
	<!-- Center the vis -->
	<!-- FIXME: Use camera-controls to fit view to object? -->
	<!-- <T.Group position={[-data[0].length / 2, data.length / 2, 0]}> -->
	<T.Group let:ref>
		<Flex
			gap={1}
			on:reflow={({ width, height }) => {
				$cameraControls.fitToBox(ref, false, {
					paddingTop: padding,
					paddingRight: padding,
					paddingBottom: padding,
					paddingLeft: padding
				});
			}}
		>
			<!-- Direct path -->
			<Box>
				<Heatmap data={getColumns(data, [0])} {colorScale} direction={'column'} />
			</Box>

			<!-- Head paths -->
			{#each range($modelConfig.numLayers) as i}
				{@const start = 1 + i * $modelConfig.numHeads}
				{@const end = start + $modelConfig.numHeads}

				<Box>
					<Heatmap
						data={getColumns(data, range(start, end))}
						{colorScale}
						i={i + 1}
						direction="column"
					/>
				</Box>
			{/each}
		</Flex>
	</T.Group>
{/await}
