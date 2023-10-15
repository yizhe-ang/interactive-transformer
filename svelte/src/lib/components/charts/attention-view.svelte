<script>
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, interactivity, transitions } from '@threlte/extras';
	import AttentionMap from './attention-map-webgl.svelte';
	import * as THREE from 'three';
	import { Flex, Box } from '@threlte/flex';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { attentionMaps, selectedAttentionMap } from '$lib/stores.js';
	import { attentionColorScale } from '$lib/constants.js';
	import Heatmap from '$components/charts/heatmap.svelte';

	// TODO:
	// https://threlte.xyz/docs/reference/flex/getting-started

	// TODO: How to have a summary visualization for each layer?
	// TODO: Have an average attention map for each layer?

	interactivity();
	transitions();

	const clickedI = writable(null);
	setContext('clickedI', clickedI);

	const { size, renderer, scene, camera } = useThrelte();

	$: onSizeChange($size);
	function onSizeChange() {
		// To prevent flickering on resize
		renderer.render(scene, $camera);
	}

	const numColumns = 3;
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 200]} far={1000} near={0.1}>
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

<!-- TODO: Use InstancedMesh to be more efficient? -->
{#await attentionMaps.load() then _}
	{@const width = $attentionMaps[0].length}
	{@const gap = width / 5}
	<Flex width={(width + gap) * numColumns} flexWrap="Wrap" {gap}>
		{#each $attentionMaps as data, i}
			<Box>
				<Heatmap {data} {i} colorScale={attentionColorScale} />
			</Box>
		{/each}
	</Flex>
{/await}
