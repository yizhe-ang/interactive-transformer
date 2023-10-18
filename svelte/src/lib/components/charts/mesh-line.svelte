<script>
	import { T } from '@threlte/core';
	import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
	import colors from 'tailwindcss/colors';

	export let points;
	export let width = 0.1;
	export let color = colors.slate['500'];
	export let opacity = 1;
</script>

<T.Mesh>
	<MeshLineGeometry {points} />
	<MeshLineMaterial {width} {color} {opacity} transparent />
</T.Mesh>
