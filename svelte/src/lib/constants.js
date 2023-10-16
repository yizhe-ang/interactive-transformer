import {
	scaleSequential,
	interpolatePuBuGn,
	interpolateCubehelixDefault,
	interpolatePiYG,
	scaleDiverging
} from 'd3';

export const attentionColorScale = (d) => {
  // Don't render 0 values
	if (d == 0) {
		return null;
	} else {
		return scaleSequential(interpolatePuBuGn)(d);
	}
};
// export const attentionColorScale = scaleSequential((t) => interpolateCubehelixDefault(1 - t));

export const logitAttributionColorScale = scaleDiverging(interpolatePiYG);
