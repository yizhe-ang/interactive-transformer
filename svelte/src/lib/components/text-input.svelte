<script>
	import { Textarea } from '$ui/textarea';
	import { onMount } from 'svelte';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import * as Card from '$ui/card';
	import { inputText, tokens, selectedAttentionMap } from '$lib/stores.js';
	import Token from '$components/token.svelte';

	// let editor;

	// onMount(() => {
	// 	editor = createEditor({
	// 		extensions: [
	// 			StarterKit,
	// 			Underline.configure({
	// 				HTMLAttributes: {
	// 					class: 'underline-offset-4 decoration-slate-300 decoration-2'
	// 				}
	// 			}),
	// 			Highlight.configure({
	// 				HTMLAttributes: {
	// 					class: 'rounded-sm py-1'
	// 				}
	// 			})
	// 		],
	// 		editorProps: {
	// 			attributes: {
	// 				class: 'text-lg w-[65ch] p-2 tracking-wide'
	// 			}
	// 		},
	// 		content: $inputText,
	// 		// Events
	// 		onUpdate: ({ editor }) => {
	// 			const text = editor.getText();

	// 			$inputText = text;
	// 		}
	// 	});
	// });
</script>

<!-- <Textarea bind:value placeholder="input text" class="text-xl w-[65ch] bg-background" /> -->

<Card.Root class="pointer-events-auto">
	<Card.Header />
	<Card.Content>
		<!-- <EditorContent editor={$editor} /> -->
		<div
			contenteditable="true"
			class="text-lg w-[65ch] p-2 tracking-wide"
			on:input={(e) => {
				// Delete first token
				$inputText = e.target.textContent;
			}}
		>
			{$inputText}
			<!-- {#await Promise.all([tokens.load(), selectedAttentionMap.load()]) then _}
				{#each $tokens as token, i}
					<Token text={token} data={$selectedAttentionMap[$selectedAttentionMap.length - 1][i]} />
				{/each}
			{/await} -->
		</div>
		<div class="text-lg w-[65ch] p-2 tracking-wide">
			{#await Promise.all([tokens.load(), selectedAttentionMap.load()]) then _}
				{#each $tokens as token, i}
					<Token text={token} data={$selectedAttentionMap[$selectedAttentionMap.length - 1][i]} />
				{/each}
			{/await}
		</div>
	</Card.Content>
</Card.Root>

<!-- {#await tokens then tokens}
  {tokens}
{/await} -->
