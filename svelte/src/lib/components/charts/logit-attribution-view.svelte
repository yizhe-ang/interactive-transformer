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
	import { onMount, setContext } from 'svelte';

	interactivity();
	transitions();

	const { size, renderer, scene, camera } = useThrelte();

	$: onSizeChange($size);
	function onSizeChange() {
		// To prevent flickering on resize
		renderer.render(scene, $camera);
	}

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
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 70]} far={300} near={0.1}>
	<OrbitControls
		enableDamping
		mouseButtons={{
			RIGHT: THREE.MOUSE.ROTATE,
			MIDDLE: THREE.MOUSE.DOLLY,
			LEFT: THREE.MOUSE.PAN
		}}
		zoomSpeed={0.3}
	/>
</T.PerspectiveCamera>

{#await logitAttributionData.load() then _}
	<!-- Center the vis -->
	<!-- FIXME: Use camera-controls to fit view to object? -->
	<T.Group position={[-data[0].length / 2, data.length / 2, 0]}>
		<Flex gap={1}>
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
