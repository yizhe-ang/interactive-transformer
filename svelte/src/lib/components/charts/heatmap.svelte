<script>
	import MeshLine from '$components/charts/mesh-line.svelte';
	import { T } from '@threlte/core';
	import { Vector3, Color, ShaderMaterial, DataTexture } from 'three';
	import { spring } from 'svelte/motion';
	import { getContext } from 'svelte';
	import { getColumns, opacityTransition } from '$lib/helpers.js';

	export let data;
	export let colorScale;
  export let i = 0;
  export let direction = "row"

	const selectedData = getContext('selectedData');

	const outlinePositionX = spring(0);
	const outlineOpacity = spring(0);

	let texture;
	let width;
	let height;

	$: onDataUpdate(data);
	function onDataUpdate(data) {
		height = data.length;
		width = data[0].length;

		const colors = new Uint8Array(width * height * 4);

		// Update data
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				const k = i * width + j;

				const color = new Color(colorScale(data[i][j]));

				colors[k * 4 + 0] = Math.floor(color.r * 255);
				colors[k * 4 + 1] = Math.floor(color.g * 255);
				colors[k * 4 + 2] = Math.floor(color.b * 255);
				colors[k * 4 + 3] = 255;
			}
		}

		texture = new DataTexture(colors, width, height);
		texture.needsUpdate = true;
		texture.flipY = true;
	}

	const vertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;
    }
  `;

	const fragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      vec4 textureColor = texture2D(uTexture, vUv);

      // gl_FragColor = textureColor;
      gl_FragColor = vec4(textureColor.rgb, uOpacity);
    }
  `;

	// Define shader material
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uTexture: {
				value: texture
			},
			uOpacity: {
				value: 1
			}
		}
	});

	// Update shader uniforms
	$: material.uniforms.uTexture.value = texture;

	// $: selectedI = 0;

	// $: $selectedData = getColumns(data, [selectedI])
	// 	.flat()
	// 	.map((d) => colorScale(d));
</script>

<T.Mesh
	on:pointermove={(e) => {
		// $outlinePositionX = Math.floor(e.point.x + 0.5) - 0.5;

		const selectedI = Math.floor(e.uv.x * width);
		$outlinePositionX = selectedI - width / 2;

		$selectedData = getColumns(data, [selectedI])
			.flat()
			.map((d) => colorScale(d));
	}}
	on:pointerenter={(e) => {
		$outlineOpacity = 1;
	}}
	on:pointerleave={(e) => {
		$outlineOpacity = 0;
	}}
>
	<T.PlaneGeometry args={[width, height]} />
	<T is={material} attach="material" transition={opacityTransition(i)} />
</T.Mesh>

<!-- Outline -->
<!-- TODO: Change to a glass / lens material? Like a microscope, refraction etc. -->
<T.Group position.z={0.1} opacity={0}>
	{#each [0, 1] as x}
		<MeshLine
			points={[
				new Vector3($outlinePositionX + x, -height / 2, 0),
				new Vector3($outlinePositionX + x, height / 2, 0)
			]}
			opacity={$outlineOpacity}
		/>
	{/each}
</T.Group>
