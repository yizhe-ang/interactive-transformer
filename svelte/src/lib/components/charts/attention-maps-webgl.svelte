<script>
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, interactivity, transitions } from '@threlte/extras';
	import AttentionMap from './attention-map-webgl.svelte';
	import * as THREE from 'three';
	import { Flex, Box } from '@threlte/flex';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { attentionMaps, selectedAttentionMap } from '$lib/stores.js';

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
	const gap = 0.1;
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 10]} far={50} near={0.1}>
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
<Flex width={numColumns + (numColumns - 1) * gap} flexWrap="Wrap" gap={0.1}>
	{#await attentionMaps.load() then _}
		{#each $attentionMaps as data, i}
			<T.Group>
				<Box width={1} height={1}>
					<!-- HACK: -->
					<!-- {#key data} -->
					<AttentionMap {data} {i} />
					<!-- {/key} -->
				</Box>
			</T.Group>
		{/each}
	{/await}
</Flex>
