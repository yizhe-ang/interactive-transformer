<script>
	import { T } from '@threlte/core';
	import { Text, createTransition, useCursor } from '@threlte/extras';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Color, DataTexture, ShaderMaterial, Vector2 } from 'three';
	import { selectedAttentionMapI, selectedTokenI } from '$lib/stores.js';
	import { attentionColorScale } from '$lib/constants.js';
	import { getContext, onMount } from 'svelte';
	import { range, scaleBand, scaleQuantize } from 'd3';

	// FIXME: Interaction handling is messy
	// Is there a ui component for this?

	export let data;
	export let i = 0;

	let mouseUv = new Vector2(-1, -1);

	const clickedI = getContext('clickedI');
	$: clicked = $clickedI == i;

	const colorScale = attentionColorScale;

	let texture;

	$: onDataUpdate(data);
	function onDataUpdate(data) {
		const colors = new Uint8Array(data.length * data.length * 4);

		// Update data
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data.length; j++) {
				const k = i * data.length + j;

				// Make it lower triangular
				if (j > i) {
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

		texture = new DataTexture(colors, data.length, data.length);
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

	// FIXME: Rounded edges or circle?
	const fragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform vec2 uMouseUv;
    uniform float uLineY;
    uniform float uBandWidth;
    varying vec2 vUv;

    void main() {
      vec4 textureColor = texture2D(uTexture, vUv);

      // Discard if not lower triangular
      if (textureColor.a == 0.0) discard;

      float lineWidth = uBandWidth / 15.0;

      // FIXME: Get rid of branching?
      // Draw horizontal line
      bool isTopLine = abs(uLineY - vUv.y + lineWidth + uBandWidth) < lineWidth;
      bool isBottomLine = abs(uLineY - vUv.y - lineWidth) < lineWidth;
      bool isLine = isTopLine || isBottomLine;

      // FIXME: Change line color
      gl_FragColor = isLine ? vec4(vec3(0.0), 1.0) : textureColor;
    }
  `;

	// Transitions
	const { hovering } = useCursor();
	const scale = spring(0.9);

	$: animDelay = i * 70;

	const scaleTransition = createTransition((ref, { direction }) => {
		return {
			tick(t) {
				ref.scale.setScalar(t);
			},
			delay: animDelay + (direction === 'in' ? 200 : 0),
			duration: 200,
			easing: direction === 'in' ? cubicOut : cubicIn
		};
	});

	$: updateScale($hovering, clicked);
	function updateScale() {
		if (clicked) {
			$scale = 1;
		} else if (!clicked) {
			if ($hovering) {
				$scale = 1;
			} else {
				$scale = 0.9;
			}
		}
	}

	$: if ($clickedI == null) {
		if ($hovering) $selectedAttentionMapI = i;
	}

	// Get selected destination token
	let lineY = -1;

	$: uvToTokenScale = scaleQuantize([0, 1], range(data.length - 1, -1, -1));
	$: tokenToUvScale = scaleBand(range(data.length), [1, 0]);
	$: bandWidth = tokenToUvScale.bandwidth();

	// Define shader material
	const material = new ShaderMaterial({
		fragmentShader,
		vertexShader,
		uniforms: {
			uTexture: {
				value: texture
			},
			uMouseUv: {
				value: mouseUv
			},
			uLineY: {
				value: lineY
			},
			uBandWidth: {
				value: bandWidth
			}
		}
	});

	$: onSelectedTokenUpdate($selectedTokenI);
	function onSelectedTokenUpdate() {
		if ($selectedAttentionMapI == i || $hovering) lineY = tokenToUvScale($selectedTokenI);

    console.log($selectedTokenI)
	}

	// Update shader uniforms
	$: material.uniforms.uMouseUv.value = mouseUv;
	$: material.uniforms.uTexture.value = texture;
	$: material.uniforms.uLineY.value = lineY;
	$: material.uniforms.uBandWidth.value = bandWidth;
</script>

<!-- FIXME: Just use a line geometry here??? -->

<!-- HACK: -->
<T.Group in={scaleTransition} out={scaleTransition}>
	<Text
		text={i}
		fontSize={0.3}
		position={[0.4, 0.4, 0]}
		fillOpacity={clicked ? 0.9 : 0.5}
		color={clicked ? 'black' : null}
		anchorX="right"
	/>

	<!-- FIXME: Using a plane and a data texture -->
	<T.Mesh
		on:pointerenter={(e) => {
			$hovering = true;
		}}
		on:pointermove={(e) => {
			mouseUv = e.uv;

			// Find hovered token
			$selectedTokenI = uvToTokenScale(mouseUv.y);

			// Find row position
			// lineY = tokenToUvScale($selectedTokenI)
		}}
		on:pointerleave={() => {
			// mouseUv.x = -1;
			// mouseUv.y = -1;
			lineY = -1;

			$hovering = false;
		}}
		on:click={() => {
			$clickedI = $clickedI == i ? null : i;
			$selectedAttentionMapI = selectedAttentionMapI == i ? null : i;
		}}
	>
		<T.PlaneGeometry args={[1, 1]} />
		<T is={material} attach="material" />
		<!-- <T.MeshBasicMaterial transparent color={undefined} toneMapped={false}>
			<T.DataTexture
				args={[colors, data.length, data.length]}
				attach="map"
				needsUpdate
				flipY={true}
			/>
		</T.MeshBasicMaterial> -->
	</T.Mesh>
</T.Group>
