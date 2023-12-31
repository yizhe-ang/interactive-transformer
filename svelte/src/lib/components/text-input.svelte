<script>
	import { Textarea } from '$ui/textarea';
	import { onMount } from 'svelte';
	import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
	import { Extension } from '@tiptap/core';
	import { Plugin, PluginKey } from '@tiptap/pm/state';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import Placeholder from '@tiptap/extension-placeholder';
	import * as Card from '$ui/card';
	import { Toggle } from '$ui/toggle';
	import {
		inputText,
		tokens,
		attentionMaps,
		selectedTokenI,
		selectedLayer,
		selectedAttentionMapI,
		selectedAttentionMap,
		tokenData,
		selectedDataView,
		selectedAttentionRow,
		hoveredHeatmapData
	} from '$lib/stores.js';
	import { Decoration, DecorationSet } from '@tiptap/pm/view';
	import { isDarkColor } from '$lib/helpers.js';
	import { ChevronDown } from 'lucide-svelte';
	import SparkColorLegend from '$components/charts/spark-color-legend.svelte';
	import { attentionColorScaleAlt, attentionColorScale } from '$lib/constants.js';
	import { fade } from 'svelte/transition';
	import KeyTransition from '$components/key-transition.svelte';

	let editor;
	let clickedTokenI;
	let startToken;

	const editorTextClasses = 'text-lg tracking-wide';

	// TODO: Visualize start token
	// TODO: Have max-height for text-area
	// TODO: An able toggle to height-auto
	// TODO: Make text area shrink when unfocused

	function highlightText(doc) {
		if (!$tokens) return;

		const decorations = [];

		doc.descendants((node, position) => {
			if (!node.text) {
				return;
			}

			let currentPosition = position;

			// HACK:
			$tokens.forEach((t, i) => {
				if (i == 0) {
					const bgColor = $tokenData[i];
					startToken.style.backgroundColor = bgColor;

					if (isDarkColor(bgColor)) {
						startToken.classList.remove('text-foreground');
						startToken.classList.add('text-background');
					} else {
						startToken.classList.remove('text-background');
						startToken.classList.add('text-foreground');
					}

					return;
				}

				const from = currentPosition;
				const to = from + t.length;
				currentPosition = to;

				// const color = d3Color(attentionColorScale(
				// 	$selectedAttentionMap[$selectedAttentionMap.length - 1][i + 1]
				// )).formatHex()

				// if (!$selectedAttentionRow) {
				//   // console.log($selectedTokenI)
				// 	console.log(':(');
				// 	return;
				// }

				// const data = $selectedAttentionRow[i];
				// const bgColor = data == 0 ? 'transparent' : attentionColorScale(data);
				const bgColor = $tokenData[i];

				let styleClasses = `rounded-sm transition-all hover:shadow-lg hover:shadow-slate-500`;

				const underlineClass = 'underline underline-offset-4 decoration-slate-400 decoration-2';

				if (i % 2 == 0) styleClasses += ' ' + underlineClass;
				if (isDarkColor(bgColor)) styleClasses += ' text-background';

				const decoration = Decoration.inline(from, to, {
					// class: `rounded-sm ${i % 2 == 0 ? underlineClass : ''}`,
					class: styleClasses,
					style: `background-color: ${bgColor}`,
					'data-i': i
				});

				decorations.push(decoration);
			});
		});

		return DecorationSet.create(doc, decorations);
	}

	const AttentionHighlighter = Extension.create({
		name: 'attentionHighlighter',

		addProseMirrorPlugins() {
			return [
				new Plugin({
					state: {
						init(_, { doc }) {
							return highlightText(doc);
						},
						// FIXME: Only update when the reactive stores changes?
						apply(transaction, oldState) {
							// console.log(transaction.doc);
							// console.log($editor.view.docView.node);

							// return transaction.docChanged ? highlightText(transaction.doc) : oldState;
							return highlightText(transaction.doc);
						}
					},
					props: {
						decorations(state) {
							return this.getState(state);
						},
						handleDOMEvents: {
							mouseover(view, event) {
								// Update selected token
								const tokenI = +event.target.dataset.i;

								// Only filter for token dom elements
								if (isNaN(tokenI)) return;

								// if (clickedTokenI === undefined) {
								// 	$selectedTokenI = tokenI;
								// }

								// $selectedTokenI = tokenI

								if (!$selectedAttentionMapI) return;

								$selectedTokenI = tokenI;

								// Update token data
								if ($selectedDataView == 'attention') {
									$tokenData = $attentionMaps[$selectedAttentionMapI][tokenI].map((d) =>
										attentionColorScale(d)
									);
								}

								// TODO: Trigger markings in data view
							}
							// FIXME:
							// click(view, event) {
							// 	// Update selected token
							// 	const target = event.target;
							// 	const tokenI = target.dataset.i;

							// 	// Only filter for token dom elements
							// 	if (tokenI === undefined) return;

							// 	// Clicked styles
							// 	// const styles = 'shadow-lg shadow-slate-500';
							// 	const styles = 'shadow-lg';

							// 	// Unclick token
							// 	if (clickedTokenI == tokenI) {
							// 		clickedTokenI = undefined;

							// 		// Remove styles from clicked token
							// 		// target.classList.remove(styles);
							// 	} else {
							// 		clickedTokenI = tokenI;
							// 		$selectedTokenI = tokenI;

							// 		// Apply styles to clicked token
							// 		// target.classList.add(styles);
							// 		// target.classList.add("shadow-slate-500");
							// 	}
							// }
						}
					}
				})
			];
		}
	});

	onMount(() => {
		editor = createEditor({
			extensions: [
				StarterKit,
				AttentionHighlighter,
				Placeholder.configure({
					placeholder: 'input text here 🚀'
				})
				// Underline.configure({
				// 	HTMLAttributes: {
				// 		class: 'underline-offset-4 decoration-slate-300 decoration-2'
				// 	}
				// }),
				// Highlight.configure({
				// 	multicolor: true,
				// 	HTMLAttributes: {
				// 		class: 'rounded-sm py-1'
				// 	}
				// })
			],
			editorProps: {
				attributes: {
					class: 'outline-slate-300 w-[65ch] p-2 max-h-32 overflow-auto' + ' ' + editorTextClasses,
					style: 'transition: max-height 1s ease-in-out; scrollbar-gutter: stable both-edges;'
				}
			},
			content: $inputText,
			// Events
			onUpdate: ({ editor }) => {
				const text = editor.getText();

				// Send editor text for processing
				$inputText = text;
			}
		});
	});

	// When tokens and attention map updates
	// $: if ($tokens && $selectedAttentionMap) {
	// 	onUpdate($tokens, $selectedAttentionMap[$selectedAttentionMap.length - 1]);
	// }
	// function onUpdate() {
	// 	if (!$editor) return;

	// 	const content = $tokens.slice(1).map((t, i) => {
	// 		return {
	// 			type: 'text',
	// 			marks: [
	// 				{
	// 					type: 'highlight'
	// 				}
	// 			],
	// 			text: t
	// 		};
	// 	});

	//   // HACK:
	// 	$editor.commands.setContent({
	// 		type: 'doc',
	// 		content
	// 	});
	// }

	$: onUpdate($tokenData);
	function onUpdate() {
		if (!$editor || !$tokenData) return;
		// console.log($selectedAttentionRow);

		// HACK: Manually trigger an update
		// FIXME: Change this to sth else
		$editor.commands.focus();
	}

	// Make sure selectedTokenI cannot be more than number of tokens
	$: if ($tokens) onTokensChange($tokens);
	function onTokensChange() {
		if ($selectedTokenI >= $tokens.length) {
			$selectedTokenI = $tokens.length - 1;
		}
	}

	let isEditorExpanded = false;
</script>

<Card.Root class="pointer-events-auto">
	<Card.Header class="pb-1">
		{#await tokens.load() then _}
			<Card.Description class="{$tokens.length == 1 ? 'opacity-0' : ''} transition pb-2">
				{#if $selectedDataView == 'attention'}
					<span>
						how
						<SparkColorLegend colorScale={attentionColorScaleAlt}>
							<!-- <span class="relative w-full flex justify-between px-1" -->
							>
							<!-- {#key $selectedTokenI}
								<span
									transition:fade={{ duration: 200 }}
									class="text-foreground absolute left-1 font-bold">{$tokens[$selectedTokenI]}</span
								>
							{/key} -->
							<KeyTransition key={$selectedTokenI}>
								<span class="text-foreground absolute left-1 font-bold"
									>{$tokens[$selectedTokenI]}</span
								>
							</KeyTransition>
							<span class="text-background absolute right-1">attends</span>
							<!-- </span> -->
						</SparkColorLegend>
						to previous tokens in
						<span class="font-bold">layer {$selectedLayer} </span>
						->
						{#if $selectedAttentionMapI || $hoveredHeatmapData}
							<span class="font-bold"
								>attention head {$selectedAttentionMapI || $hoveredHeatmapData.i}</span
							>
						{/if}
					</span>
				{:else if $selectedDataView == 'logitAttribution'}
					<span />
				{/if}
			</Card.Description>
		{/await}
	</Card.Header>
	<Card.Content class="pb-0">
		<!-- Start token -->
		<div class="inline-block pt-2 pl-6 {editorTextClasses}">
			<span
				bind:this={startToken}
				class="text-foreground rounded-sm transition-all hover:shadow-lg hover:shadow-slate-500"
				>{`<|endoftext|>`}</span
			>
		</div>
		<EditorContent editor={$editor} />
	</Card.Content>
	<Card.Footer class="pb-0">
		<Toggle
			bind:pressed={isEditorExpanded}
			on:click={(e) => {
				const editorDom = $editor.view.dom;

				if (isEditorExpanded) {
					editorDom.classList.toggle('max-h-screen');
					editorDom.classList.toggle('max-h-32');
					editorDom.style.transition = 'max-height 0.5s cubic-bezier(0, 1, 0, 1)';
				} else {
					editorDom.classList.toggle('max-h-32');
					editorDom.classList.toggle('max-h-screen');
					editorDom.style.transition = 'max-height 1s ease-in-out';
				}
			}}
			class="w-full hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:rotate-180 transition text-slate-300 data-[state=on]:text-slate-300"
			><ChevronDown /></Toggle
		>
	</Card.Footer>
</Card.Root>

<style lang="postcss">
	:global(.tiptap) {
		& p.is-editor-empty:first-child::before {
			color: #adb5bd;
			content: attr(data-placeholder);
			float: left;
			height: 0;
			pointer-events: none;
		}
	}
</style>
