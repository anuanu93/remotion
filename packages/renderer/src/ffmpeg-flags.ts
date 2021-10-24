import execa from 'execa';
import {Internals} from 'remotion';
import {binaryExists} from './validate-ffmpeg';

let buildConfig: string | null = null;

export type FfmpegVersion = [number, number, number] | null;

export const getFfmpegBuildInfo = async () => {
	if (buildConfig !== null) {
		return buildConfig;
	}

	const data = await execa(Internals.getFfmpegExecutable() ?? 'ffmpeg', ['-buildconf']);
	buildConfig = data.stderr;
	return buildConfig;
};

export const ffmpegHasFeature = async (
	feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx'
) => {
	if (!await binaryExists('ffmpeg')) {
		return false;
	}

	const config = await getFfmpegBuildInfo();
	return config.includes(feature);
};

export const parseFfmpegVersion = (buildconf: string): FfmpegVersion => {
	const match = buildconf.match(/ffmpeg version ([0-9]+).([0-9]+)(?:.([0-9]+))?/);
	if (!match) {
		return null;
	}

	return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
};

export const getFfmpegVersion = async (): Promise<FfmpegVersion> => {
	const buildInfo = await getFfmpegBuildInfo();
	return parseFfmpegVersion(buildInfo);
};
