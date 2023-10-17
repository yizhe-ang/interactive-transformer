import {
	scaleSequential,
	interpolatePuBuGn,
	interpolateCubehelixDefault,
	interpolatePiYG,
	scaleDiverging
} from 'd3';

export const attentionColorScale = scaleSequential((t) => {
	return t == 0 ? null : interpolatePuBuGn(t);
});
export const attentionColorScaleAlt = scaleSequential(interpolatePuBuGn);

// export const attentionColorScale = scaleSequential((t) => interpolateCubehelixDefault(1 - t));

export const logitAttributionColorScale = scaleDiverging(interpolatePiYG);
