// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../libs/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	getSignedUrl(
		s3Client,
		new GetObjectCommand({
			Bucket: 'kibbewater-twatter',
			Key: '/avatars/7fe0e69f09798fc7c774d21b21641490.jpg',
		}),
		{ expiresIn: 3600 }
	)
		.then((url) => {
			res.status(200).json({ url });
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ err });
		});
}
