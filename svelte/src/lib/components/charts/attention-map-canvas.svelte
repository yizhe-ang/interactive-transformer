<script>
  import { Canvas, Layer } from "svelte-canvas"

  export let data
  export let i = 0

  const render = ({context, width, height}) => {

  }
</script>

<Canvas>
  <Layer {render} />
</Canvas>
