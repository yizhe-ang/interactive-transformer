<script>
	import MeshLine from '$components/charts/mesh-line.svelte';
	import { T, extend } from '@threlte/core';
	import {
		Vector3,
		Color,
		ShaderMaterial,
		DataTexture,
		DoubleSide,
		MeshStandardMaterial
	} from 'three';
	import { spring } from 'svelte/motion';
	import { getContext } from 'svelte';
	import { getColumns, opacityTransition } from '$lib/helpers.js';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import colors from 'tailwindcss/colors';
	import { selectedTokenI, hoveredHeatmapData } from '$lib/stores.js';
	// import { MeshTransmissionMaterial } from "@pmndrs/vanilla"
	// import { MeshTransmissionMaterial } from '$lib/TransmissionMaterial.js';
	// extend({ MeshTransmissionMaterial });

	export let data;
	export let colorScale;
	export let i = 0;
	export let direction = 'row';

	const selectedData = getContext('selectedData');
	const selectedDatum = getContext('selectedDatum');

	const outlinePosition = spring(0);
	const outlineOpacity = spring(0);

	const markerPosition = spring([0, 0]);
	const markerOpacity = spring(0);
	let markerColor = new Color();

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

				// Don't render if color is null
				if (colorScale(data[i][j]) === null) {
					colors[k * 4 + 0] = 0;
					colors[k * 4 + 1] = 0;
					colors[k * 4 + 2] = 0;
					colors[k * 4 + 3] = 0;
				} else {
					const color = new Color(colorScale(data[i][j]));

					colors[k * 4 + 0] = Math.floor(color.r * 255);
					colors[k * 4 + 1] = Math.floor(color.g * 255);
					colors[k * 4 + 2] = Math.floor(color.b * 255);
					colors[k * 4 + 3] = 255;
				}
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

      if (textureColor.a == 0.0) discard;

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

	const markerCoords = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
		[0, 0]
	];
</script>

<T.Mesh
	on:pointermove={(e) => {
		const selectedI = Math.floor(e.uv.x * width);
		const selectedJ = Math.floor((1 - e.uv.y) * height);

		const x = selectedI - width / 2;
		const y = -selectedJ - 1 + height / 2;

		if (direction == 'column') {
			$outlinePosition = x;

			$selectedData = getColumns(data, [selectedI])
				.flat()
				.map((d) => colorScale(d));
		} else if (direction == 'row') {
			$outlinePosition = y;

			$selectedData = data[selectedJ].map((d) => colorScale(d));
		}

		const d = data[selectedJ][selectedI];
		$selectedDatum = {
			value: d,
			color: colorScale(d),
			position: [x, y]
		};
		$markerPosition = $selectedDatum.position;

		markerColor = markerColor.set($selectedDatum.color);

		// FIXME: Only for attention map
		// Set selectedToken
		$selectedTokenI = selectedJ;

		$hoveredHeatmapData = {
			i
		};
	}}
	on:pointerenter={(e) => {
		$outlineOpacity = 1;
		$markerOpacity = 1;
	}}
	on:pointerleave={(e) => {
		$outlineOpacity = 0;
		$markerOpacity = 0;
	}}
>
	<T.PlaneGeometry args={[width, height]} />
	<T is={material} attach="material" transition={opacityTransition(i)} />
</T.Mesh>

<!-- Outline -->
<!-- TODO: Change to a glass / lens material? Like a microscope, refraction etc. -->
<T.Group position.z={0.1}>
	{#each [0, 1] as i}
		{@const x1 = direction == 'column' ? $outlinePosition + i : -width / 2}
		{@const x2 = direction == 'column' ? $outlinePosition + i : width / 2}
		{@const y1 = direction == 'column' ? -height / 2 : $outlinePosition + i}
		{@const y2 = direction == 'column' ? height / 2 : $outlinePosition + i}
		<MeshLine points={[new Vector3(x1, y1, 0), new Vector3(x2, y2, 0)]} opacity={$outlineOpacity} />
	{/each}

	<!-- TODO: Rounded square for selected data point? -->
	<!-- TODO: Bloom effect? -->
	<!-- <T.Mesh position={[...$markerPosition, 0]}>
		<RoundedBoxGeometry args={[1, 1, 0.1]} />
		<T.MeshStandardMaterial opacity={$markerOpacity} transparent color={markerColor} />
	</T.Mesh> -->

	<!-- Datum marker -->
	<!-- <T.Group position={[...$markerPosition, 0]}>
		<MeshLine points={markerCoords.map((c) => new Vector3(...c, 0))} opacity={$markerOpacity} color={colors.slate['900']} width={0.2} />
	</T.Group> -->

	<!-- <T.Mesh>
		<RoundedBoxGeometry args={[width, 1, 0.1]} />
		<T.MeshTransmissionMaterial
			args={[8]}
			clearcoat={1}
			clearcoatRoughness={0}
			transmission={1}
			chromaticAberration={0.1}
			anisotropy={0.1}
			roughness={0}
			thickness={4.5}
			ior={1.5}
			distortion={0.1}
			distortionScale={0.2}
			temporalDistortion={0.2}
		/>
	</T.Mesh> -->
</T.Group>
