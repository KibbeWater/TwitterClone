import { JobSettings, OutputGroup } from '@aws-sdk/client-mediaconvert';

export const DEFAULT_OUTPUTS = [
	{
		prefix: '_1080p',
		video: {
			width: 1920,
			height: 1080,
			framerate: 120,
			bitrate: 16000000,
		},
		audio: {
			bitrate: 96000,
			sampleRate: 48000,
		},
	},
	{
		prefix: '_720p',
		video: {
			width: 1280,
			height: 720,
			framerate: 120,
			bitrate: 12000000,
		},
		audio: {
			bitrate: 96000,
			sampleRate: 48000,
		},
	},
];

export function CreateJob(input: string | string[], options: OutputGroupOptions): JobSettings {
	const inputs = Array.isArray(input) ? input : [input];

	return {
		Inputs: inputs.map((input) => {
			return {
				TimecodeSource: 'ZEROBASED',
				VideoSelector: {},
				AudioSelectors: {
					'Audio Selector 1': {
						DefaultSelection: 'DEFAULT',
					},
				},
				FileInput: input,
			};
		}),
		OutputGroups: [GenerateOutputGroup(options), GenerateThumbOutput(options.destination) as OutputGroup],
		TimecodeConfig: {
			Source: 'ZEROBASED',
		},
	};
}

function GenerateOutputGroup(options: OutputGroupOptions) {
	return {
		Name: 'Apple HLS',
		OutputGroupSettings: {
			Type: 'HLS_GROUP_SETTINGS',
			HlsGroupSettings: {
				SegmentLength: 10 || options.segmentLength,
				MinSegmentLength: 0,
				SegmentControl: 'SEGMENTED_FILES',
				Destination: options.destination,
			},
		},
		Outputs: options.outputs.map((output) =>
			GenerateOutput({
				prefix: output.prefix,
				video: output.video,
				audio: output.audio,
			})
		),
	};
}

function GenerateOutput(options: OutputOptions) {
	return {
		VideoDescription: GenerateVideoOutput(options.video),
		AudioDescriptions: [GenerateAudioOutput(options.audio)],
		OutputSettings: {
			HlsSettings: {},
		},
		ContainerSettings: {
			Container: 'M3U8',
			M3u8Settings: {},
		},
		NameModifier: options.prefix,
	};
}

function GenerateThumbOutput(destination: string) {
	return {
		Name: 'Thumbnail',
		OutputGroupSettings: {
			Type: 'FILE_GROUP_SETTINGS',
			FileGroupSettings: {
				Destination: destination,
			},
		},
		Outputs: [
			{
				VideoDescription: {
					CodecSettings: {
						Codec: 'FRAME_CAPTURE',
						FrameCaptureSettings: {
							Quality: 80,
							FramerateNumerator: 30,
							FramerateDenominator: 300,
							MaxCaptures: 1,
						},
					},
					Width: 1920,
					Height: 1080,
				},
				ContainerSettings: {
					Container: 'RAW',
				},
				NameModifier: '_thumb',
				Extension: 'jpg',
			},
		],
	};
}

function GenerateVideoOutput(options: VideoOutputOptions = { width: 1920, height: 1080, framerate: 120, bitrate: 16000000 }) {
	return {
		CodecSettings: {
			Codec: 'H_264',
			H264Settings: {
				RateControlMode: 'QVBR',
				SceneChangeDetect: 'TRANSITION_DETECTION',
				QualityTuningLevel: 'SINGLE_PASS_HQ',
				MaxBitrate: options.bitrate,
				FramerateControl: 'SPECIFIED',
				FramerateNumerator: options.framerate || 60,
				FramerateDenominator: 1,
			},
		},
		Width: options.width,
		Height: options.height,
	};
}

function GenerateAudioOutput(options: AudioOutputOptions = { bitrate: 96000, sampleRate: 48000 }) {
	return {
		CodecSettings: {
			Codec: 'AAC',
			AacSettings: {
				Bitrate: options.bitrate,
				CodingMode: 'CODING_MODE_2_0',
				SampleRate: options.sampleRate,
			},
		},
		AudioSourceName: 'Audio Selector 1',
	};
}

type VideoOutputOptions = {
	width: number;
	height: number;

	framerate?: number;
	bitrate: number;
};

type AudioOutputOptions = {
	bitrate: number;
	sampleRate: number;
};

type OutputOptions = {
	prefix: string;

	video: VideoOutputOptions;
	audio: AudioOutputOptions;
};

type OutputGroupOptions = {
	segmentLength?: number;

	outputs: OutputOptions[];
	destination: string;
};
