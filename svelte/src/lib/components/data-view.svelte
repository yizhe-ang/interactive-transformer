<script>
	import AttentionView from '$components/charts/attention-view.svelte';
	import LogitAttributionView from '$components/charts/logit-attribution-view.svelte';
	import DataViewScene from '$components/data-view-scene.svelte';
	import { Canvas } from '@threlte/core';
	import { selectedDataView, tokenData, selectedDatum } from '$lib/stores.js';
	import Test from './test.svelte';
	import { setContext } from 'svelte';

	setContext('selectedData', tokenData);
	setContext('selectedDatum', selectedDatum);
</script>

<div class="w-full h-full bg-background relative">
	<Canvas colorManagementEnabled={false}>
		<DataViewScene>
			{#if $selectedDataView == 'attention'}
				<AttentionView />
			{:else if $selectedDataView == 'logitAttribution'}
				<LogitAttributionView />
			{/if}
			<!-- <Test /> -->
		</DataViewScene>
	</Canvas>
</div>
