<script>
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import AttentionMap from './attention-map.svelte';
</script>

<T.PerspectiveCamera makeDefault>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<AttentionMap />
