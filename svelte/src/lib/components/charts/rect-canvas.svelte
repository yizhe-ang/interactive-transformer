<script>
	import { Layer } from 'svelte-canvas';

	export let x;
	export let y;
	export let width;
	export let height;
	export let fill;

	// TODO: Make this rounded?

	$: render = ({ context }) => {
		context.fillStyle = fill;
		context.fillRect(x - width / 2, y - height / 2, width, height);
	};
</script>

<Layer {render} />
