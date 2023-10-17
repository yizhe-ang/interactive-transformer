<script>
	// TODO:
	// https://threlte.xyz/docs/reference/flex/getting-started

	// TODO: How to have a summary visualization for each layer?
	// TODO: Have an average attention map for each layer?

	import { T, extend, useFrame, useThrelte } from '@threlte/core';
	import { Text, interactivity, transitions } from '@threlte/extras';
	import * as THREE from 'three';
	import { Flex, Box } from '@threlte/flex';
	import { writable } from 'svelte/store';
	import { getContext, onMount, setContext } from 'svelte';
	import { attentionMaps, tokenData } from '$lib/stores.js';
	import { attentionColorScale } from '$lib/constants.js';
	import Heatmap from '$components/charts/heatmap.svelte';

	const cameraControls = getContext('cameraControls');

	const numColumns = 3;

	const clickedI = writable(null);
	setContext('clickedI', clickedI);

	setContext('selectedData', tokenData);

	onMount(() => {
		attentionMaps.load().then((data) => {
			$tokenData = data[0][0].map((d) => attentionColorScale(d));
		});
	});
</script>

<!-- TODO: Use InstancedMesh to be more efficient? -->
{#await attentionMaps.load() then _}
	<T.Group let:ref>
		{@const boxWidth = $attentionMaps[0].length}
		{@const gap = boxWidth / 5}
		<Flex
			width={(boxWidth + gap) * numColumns}
			flexWrap="Wrap"
			{gap}
			on:reflow={({ width, height }) => {
				$cameraControls.fitToBox(ref, false, {
					paddingTop: gap,
					paddingRight: gap,
					paddingBottom: gap,
					paddingLeft: gap
				});
			}}
		>
			{#each $attentionMaps as data, i}
				<Box>
					<Heatmap {data} {i} colorScale={attentionColorScale} renderZero={false} />

					{@const fontSize = boxWidth * 0.4}
					<Text
						text={i}
						{fontSize}
						position={[boxWidth / 2, boxWidth / 2, 0]}
						color="grey"
						anchorX="right"
					/>
				</Box>
			{/each}
		</Flex>
	</T.Group>
{/await}
