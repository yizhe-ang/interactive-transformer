<script>
	import { Textarea } from '$ui/textarea';
	import { onMount } from 'svelte';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import * as Card from '$ui/card';
	import { inputText, tokens, selectedAttentionMap } from '$lib/stores.js';

	let editor;

	$: console.log($selectedAttentionMap);
	$: console.log($tokens);

	onMount(() => {
		editor = createEditor({
			extensions: [
				StarterKit,
				Underline.configure({
					HTMLAttributes: {
						class: 'underline-offset-4 decoration-slate-300 decoration-2'
					}
				}),
				Highlight.configure({
					HTMLAttributes: {
						class: 'rounded-sm py-1'
					}
				})
			],
			editorProps: {
				attributes: {
					class: 'text-lg w-[65ch] p-2 tracking-wide'
				}
			},
			content: $inputText,
			// Events
			onUpdate: ({ editor }) => {
				const text = editor.getText();

				$inputText = text;
			}
		});
	});

	function formatText() {}
</script>

<!-- <Textarea bind:value placeholder="input text" class="text-xl w-[65ch] bg-background" /> -->

<Card.Root>
	<Card.Header />
	<Card.Content>
		<EditorContent editor={$editor} />
	</Card.Content>
</Card.Root>

<!-- {#await tokens then tokens}
  {tokens}
{/await} -->
