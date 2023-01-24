import { CreateJobCommand, MediaConvertClient } from '@aws-sdk/client-mediaconvert';
import { S3_REGION } from '../../storage';
import { CreateJob, DEFAULT_OUTPUTS } from './outputs';

export const SUPPORTED_RESOLUTIONS = ['4K', '2K', 'HD', 'SD'];

export const VIDEO_DIRECTORY_RAW = 'video_raw/';
export const VIDEO_DIRECTORY_TRANSCODED = 'video_streaming/';

const emcClient = new MediaConvertClient({});

export function TranscodeVideo(videoId: string, extension: string): Promise<string> {
	return new Promise((resolve) => {
		const input = `${VIDEO_DIRECTORY_RAW}${videoId}.${extension}`;
		const output = `${VIDEO_DIRECTORY_TRANSCODED}${videoId}.mp4`;

		const command = new CreateJobCommand({
			Role: 'arn:aws:iam::338749429218:role/service-role/Transposer',
			Settings: CreateJob(`s3://${S3_REGION}/${input}`, { outputs: DEFAULT_OUTPUTS }),
		});

		emcClient.send(command).then((data) => {
			if (!data.Job?.Arn) throw new Error('MediaConvert job creation failed');
			resolve(data.Job?.Arn);
		});
	});
}
