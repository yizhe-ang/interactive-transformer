import {
	asyncDerived,
	asyncReadable,
	writable,
	derived,
	asyncWritable
} from '@square/svelte-store';
import { getColumns } from './helpers';
import { spring } from 'svelte/motion';

export const flowView = writable(undefined)

export const dataViewSize = spring(0);

export const selectedDataView = writable(undefined);
// export const selectedDataView = writable('attention');
// export const selectedDataView = writable('logitAttribution');

// export const inputText = writable(
// 	`Natural language processing tasks, such as question answering, machine translation, reading comprehension, and summarization, are typically approached with supervised learning on taskspecific datasets.`
// );
export const inputText = writable(
	'We think that powerful, significantly superhuman machine intelligence is more likely than not to be created this century. If current machine learning techniques were scaled up to this level, we think they would by default produce systems that are deceptive or manipulative, and that no solid plans are known for how to avoid this.'
);
// export const inputText = writable(
// 	'rias [( Cyt decreasingINC neat post 99cancerchurch hat patientrel Downtown associMarkerincoln cyl Addingometric confusing Moment val dirtyigrant WasITCHopeerver queriesaccount sinister files courtesyulasprot rockybounds aspect indoors turkeyigion :filed preparedumbentailsoste competenceitatingrias [( Cyt decreasingINC neat post 99cancerchurch hat patientrel Downtown associMarkerincoln cyl Addingometric confusing Moment val dirtyigrant WasITCHopeerver queriesaccount sinister files courtesyulasprot rockybounds aspect indoors turkeyigion :filed preparedumbentailsoste competenceitating'
// );

export const selectedLayer = writable(0);

export const selectedAttentionMapI = writable(null);

export const selectedTokenI = writable(0);

export const hoveredHeatmapData = writable(undefined);

// export const numLayers = asyncReadable(undefined, async () => {
// 	const response = await fetch(`http://localhost:8000/num_layers`);

// 	return await response.json();
// });

export const modelConfig = asyncReadable(undefined, async () => {
	const response = await fetch(`http://localhost:8000/model_config`);

	return await response.json();
});

export const tokens = asyncDerived(inputText, async ($inputText) => {
	const response = await fetch(`http://localhost:8000/input_text`, {
		method: 'POST',
		body: JSON.stringify({ text: $inputText }),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	return await response.json();
});

export const attentionMaps = asyncDerived([selectedLayer, tokens], async ([$selectedLayer]) => {
	const response = await fetch(`http://localhost:8000/attention_maps/${$selectedLayer}`);

	return await response.json();
});

export const selectedAttentionMap = derived(
	[attentionMaps, selectedAttentionMapI],
	([$attentionMaps, $selectedAttentionMapI]) => {
		return $attentionMaps?.[$selectedAttentionMapI];
	}
);

export const selectedAttentionRow = derived(
	[selectedAttentionMap, selectedTokenI],
	([$selectedAttentionMap, $selectedTokenI]) => {
		return $selectedAttentionMap?.[$selectedTokenI];
	}
);

export const logitAttributionData = asyncDerived(tokens, async () => {
	const response = await fetch(`http://localhost:8000/logit_attributions`);

	return await response.json();
});

// export const selectedLogitPath = ()

// export const selectedLogitAttributionData = asyncWritable(
// 	logitAttributionData,
// 	async ($logitAttributionData) => {
// 		return getColumns($logitAttributionData, [0]).flat();
// 	}
// );

export const tokenData = writable(undefined);

export const selectedDatum = writable({
	position: [0, 0]
});
