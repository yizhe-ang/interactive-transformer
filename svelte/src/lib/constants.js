import { scaleSequential, interpolatePuBuGn, interpolateCubehelixDefault } from 'd3';

export const attentionColorScale = scaleSequential(interpolatePuBuGn);
// export const attentionColorScale = scaleSequential((t) => interpolateCubehelixDefault(1 - t));
