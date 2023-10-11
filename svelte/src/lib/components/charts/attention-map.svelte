<script>
	import { T } from '@threlte/core';
	import { createTransition, useCursor } from '@threlte/extras';
	import { scaleBand, scaleSequential, range, interpolateCividis, interpolatePuBuGn } from 'd3';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Color, MeshBasicMaterial, PlaneGeometry } from 'three';
	import { selectedAttentionMapI } from '$lib/stores.js';
	import { attentionColorScale } from '$lib/constants.js';

	export let data;
	export let i = 0;

	// FIXME: Make this reactive to data

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
			}
		}
	}

	const vertexShader = /* glsl */ `
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
      vColor = color;

      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;

      float size = 120.0;
      gl_PointSize = size * (1.0 / - viewPosition.z);
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

	$: onHover($hovering);
	function onHover(hovering) {
		scale.set(hovering ? 1 : 0.9);

		if (hovering) {
			$selectedAttentionMapI = i;
		}
	}
</script>

<!-- HACK: -->
<T.Mesh on:pointerenter={onPointerEnter} on:pointerleave={onPointerLeave}>
	<T.PlaneGeometry args={[1, 1]} />
	<T.MeshBasicMaterial transparent opacity={0} />
</T.Mesh>
<T.Group in={scaleTransition} out={scaleTransition}>
	<T.Points scale={[$scale, $scale, 1]}>
		<T.BufferGeometry>
      <!-- FIXME: Set this manually? -->
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
		</T.BufferGeometry>
		<T.ShaderMaterial {vertexShader} {fragmentShader} />
	</T.Points>
</T.Group>
