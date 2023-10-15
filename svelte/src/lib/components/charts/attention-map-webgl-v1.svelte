<script>
	import { T, useThrelte } from '@threlte/core';
	import { Text, createTransition, useCursor } from '@threlte/extras';
	import { scaleBand, scaleSequential, range, interpolateCividis, interpolatePuBuGn } from 'd3';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Color, MeshBasicMaterial, PlaneGeometry } from 'three';
	import { selectedAttentionMapI } from '$lib/stores.js';
	import { attentionColorScale } from '$lib/constants.js';
	import { getContext } from 'svelte';

	// FIXME: Interaction handling is messy
	// Is there a ui component for this?

	const { size } = useThrelte();

	export let data;
	export let i = 0;

	const clickedI = getContext('clickedI');

	$: clicked = $clickedI == i;

	const colorScale = attentionColorScale;

	let xScale;
	let yScale;
	let positions;
	let colors;

	$: onDataUpdate(data);
	function onDataUpdate(data) {
		xScale = scaleBand(range(data.length), [-0.5, 0.5]);
		yScale = scaleBand(range(data.length), [0.5, -0.5]);
		positions = new Float32Array(data.length * data.length * 3);
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data.length; j++) {
				const k = i * data.length + j;

				positions[k * 3 + 0] = xScale(i);
				positions[k * 3 + 1] = yScale(j);
				positions[k * 3 + 2] = 0;
			}
		}

		colors = new Float32Array(data.length * data.length * 3);
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data.length; j++) {
				const k = i * data.length + j;

				const color = new Color(colorScale(data[j][i]));

				colors[k * 3 + 0] = color.r;
				colors[k * 3 + 1] = color.g;
				colors[k * 3 + 2] = color.b;

				// HACK: Make it lower triangular
				if (i > j) {
					colors[k * 3 + 0] = 1;
					colors[k * 3 + 1] = 1;
					colors[k * 3 + 2] = 1;
				}
			}
		}
	}

	const vertexShader = /* glsl */ `
    uniform float viewportHeight;
    uniform float pointSize;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
      vColor = color;

      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;

      gl_PointSize = viewportHeight * pointSize * 2.0 * (1.0 / - viewPosition.z);
    }
  `;

	// FIXME: Rounded edges or circle?
	const fragmentShader = /* glsl */ `
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.);
    }
  `;

	// Transitions
	const { onPointerEnter, onPointerLeave, hovering } = useCursor();
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

	// $: onHover($hovering);
	// function onHover(hovering) {
	// 	if ($clickedI != i) {
	// 		scale.set(hovering ? 1 : 0.9);
	// 	}

	// 	if (hovering) {
	// 		if ($clickedI == null) $selectedAttentionMapI = i;
	// 	}
	// }

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
</script>

<!-- HACK: -->
<T.Group in={scaleTransition} out={scaleTransition} position.z={5}>

  <!-- Using particles -->
	<T.Points scale={[$scale, $scale, 1]}>
		<T.BufferGeometry>
			<!-- FIXME: Set this manually? -->
			<!-- Re-render whenever data changes -->
			{#key data}
				<T.BufferAttribute
					attach="attributes.position"
					count={data.length * data.length}
					array={positions}
					itemSize={3}
				/>
				<T.BufferAttribute
					attach="attributes.color"
					count={data.length * data.length}
					array={colors}
					itemSize={3}
				/>
			{/key}
		</T.BufferGeometry>
		{#key xScale}
			<T.ShaderMaterial
				{vertexShader}
				{fragmentShader}
				uniforms={{
					viewportHeight: {
						value: $size.height
					},
					pointSize: {
						value: xScale.bandwidth()
					}
				}}
			/>
		{/key}
	</T.Points>
	<Text
		text={i}
		fontSize={0.3}
		position={[0.1, 0.2, 0]}
		fillOpacity={clicked ? 0.9 : 0.5}
		color={clicked ? 'black' : null}
	/>

	<!-- FIXME: Using a plane and a data texture -->
	<T.Mesh
		on:pointerenter={onPointerEnter}
		on:pointerleave={onPointerLeave}
		on:click={() => {
			$clickedI = $clickedI == i ? null : i;
			$selectedAttentionMapI = selectedAttentionMapI == i ? null : i;
		}}
	>
		<T.PlaneGeometry args={[1, 1]} />
		<T.MeshBasicMaterial transparent opacity={0} />
	</T.Mesh>
</T.Group>
