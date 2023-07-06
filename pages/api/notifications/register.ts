import AWS from 'aws-sdk';
import { getCookie } from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next';

import DB from '../../../libs/database';
import User from '../../../schemas/IUser';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const { deviceID } = req.body;

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		DB(async () => {
			User.authenticate(token).then((user) => {
				if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

				const sns = new AWS.SNS({ region: process.env.S3_REGION || 'us-east-1' });
			});
		});
	});
}
