<script>
	import * as Select from '$ui/select';

	import { selectedLayer, numLayers } from '$lib/stores.js';

	let selected = {
		disabled: false,
		label: '0',
		value: 0
	};

	$: $selectedLayer = selected.value;
</script>

<Select.Root bind:selected>
	<Select.Trigger class="pointer-events-auto bg-background w-20">
		<Select.Value placeholder="Layer" />
	</Select.Trigger>
	<Select.Content>
		{#await numLayers.load() then _}
			{#each Array($numLayers).keys() as i}
				<Select.Item value={i}>{i}</Select.Item>
			{/each}
		{/await}
	</Select.Content>
</Select.Root>
