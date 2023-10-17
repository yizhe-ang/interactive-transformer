<script>
	import { T, extend, useFrame, useThrelte } from '@threlte/core';
	import { Environment, interactivity, transitions } from '@threlte/extras';
	import * as THREE from 'three';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import CameraControls from 'camera-controls';

	CameraControls.install({ THREE: THREE });
	extend({
		CameraControls
	});

	interactivity();
	transitions();

	const { size, renderer, scene, camera } = useThrelte();

	const cameraControls = writable(undefined);
	setContext('cameraControls', cameraControls);

	$: onSizeChange($size);
	function onSizeChange() {
		// To prevent flickering on resize
		renderer.render(scene, $camera);
	}

	useFrame(({}, delta) => {
		$cameraControls.update(delta);
	});
</script>

<T.PerspectiveCamera let:ref makeDefault position={[0, 0, 200]} far={1000} near={0.1}>
	<T.CameraControls
		bind:ref={$cameraControls}
		args={[ref, renderer.domElement]}
		mouseButtons.left={CameraControls.ACTION.TRUCK}
		mouseButtons.right={CameraControls.ACTION.ROTATE}
	/>
</T.PerspectiveCamera>

<T.DirectionalLight intensity={0.5} />
<T.AmbientLight intensity={0.5} />

<!-- FIXME: Have an environment map too? -->
<!-- <Environment
  path="/"
  files="shanghai_riverside_1k.hdr"
  format="hdr"
/> -->

<slot />
