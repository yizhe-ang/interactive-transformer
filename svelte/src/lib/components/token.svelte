<script>
  import { attentionColorScale } from "$lib/constants.js"

	export let text;
	export let data;

  const colorScale = attentionColorScale

  // FIXME: Underline to delineate tokens?
</script>

<mark
  class="rounded-sm py-1 transition bg-transparent"
  style:background-color={attentionColorScale(data)}
>
	{text}
</mark>
