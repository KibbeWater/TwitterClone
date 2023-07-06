import { getCookie } from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next';

import { CreatePlatformEndpointCommand, SNSClient } from '@aws-sdk/client-sns';
import DB from '../../../libs/database';
import User from '../../../schemas/IUser';
import NotificationDevice from '../../../schemas/INotificationEndpoints';
import { DeviceTypeEnum } from '../../../types/INotificationEndpoints';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const { deviceID } = req.body;

		if (!deviceID) return resolve(res.status(400).json({ success: false, error: 'Missing fields' }));

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		DB(async () => {
			User.authenticate(token)
				.then((user) => {
					if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

					const sns = new SNSClient({
						region: process.env.SNS_REGION,
						credentials: {
							accessKeyId: process.env.SNS_ACCESS_KEY_ID as string,
							secretAccessKey: process.env.SNS_SECRET_ACCESS_KEY as string,
						},
					});

					const command = new CreatePlatformEndpointCommand({
						PlatformApplicationArn: process.env.SNS_ARN as string,
						Token: deviceID,
					});

					sns.send(command).then(async (data) => {
						if (!data) return resolve(res.status(400).json({ success: false, error: 'Failed to register device' }));

						NotificationDevice.createDevice(user._id, 0 as unknown as DeviceTypeEnum, deviceID)
							.then((device) => {
								if (!device) return resolve(res.status(500).json({ success: false, error: 'Failed to create device' }));
								return resolve(res.status(200).json({ success: true, data: device }));
							})
							.catch((err) => {
								console.error(err);
								return resolve(res.status(500).json({ success: false, error: 'Failed to create device' }));
							});
					});
				})
				.catch((err) => {
					console.error(err);
					return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));
				});
		});
	});
}
