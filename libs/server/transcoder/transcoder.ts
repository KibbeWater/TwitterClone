import { CreateJobCommand, MediaConvertClient } from '@aws-sdk/client-mediaconvert';
import { S3_BUCKET, S3_REGION } from '../../server/storage';
import { CreateJob, DEFAULT_OUTPUTS } from './outputs';

export const SUPPORTED_RESOLUTIONS = ['4K', '2K', 'HD', 'SD'];

export const VIDEO_DIRECTORY_RAW = 'video_raw/';
export const VIDEO_DIRECTORY_TRANSCODED = 'video_streaming/';

export const TRANSCODE_REGION = process.env.TRANSCODE_REGION || 'us-east-1';

const emcClient = new MediaConvertClient({
	region: TRANSCODE_REGION,
	endpoint: process.env.TRANSCODE_ENDPOINT as string,
	credentials: {
		accessKeyId: process.env.TRANSCODE_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.TRANSCODE_SECRET_ACCESS_KEY as string,
	},
});

export function TranscodeVideo(videoId: string, extension: string): Promise<{ trackId: string; output: string }> {
	return new Promise((resolve, reject) => {
		const input = `${VIDEO_DIRECTORY_RAW}${videoId}.${extension}`;
		const output = `${VIDEO_DIRECTORY_TRANSCODED}${videoId}`;

		emcClient
			.send(
				new CreateJobCommand({
					Role: 'arn:aws:iam::338749429218:role/service-role/Transposer',
					Settings: CreateJob(`s3://${S3_BUCKET}/${input}`, {
						destination: `s3://${S3_BUCKET}/${output}`,
						segmentLength: 5,
						outputs: DEFAULT_OUTPUTS,
					}),
				})
			)
			.then((data) => {
				if (!data.Job?.Arn) return reject('MediaConvert job creation failed');
				resolve({ trackId: data.Job?.Arn, output });
			})
			.catch((err) => {
				console.error(err);
				reject('MediaConvert job creation failed');
			});
	});
}
