<script>
	import { fade } from 'svelte/transition';

	export let key;
	export let transition = fade;
	export let transitionOptions = { duration: 200 };
</script>

{#key key}
	<span transition:transition={transitionOptions}>
		<slot />
	</span>
{/key}
