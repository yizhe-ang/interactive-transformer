import { asyncDerived, writable, derived } from '@square/svelte-store';

export const inputText = writable(
	`Natural language processing tasks, such as question answering, machine translation, reading comprehension, and summarization, are typically approached with supervised learning on taskspecific datasets.`
);

export const selectedLayer = writable(0);

export const selectedAttentionMapI = writable(0);

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
