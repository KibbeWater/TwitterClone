import type { NextApiRequest, NextApiResponse } from 'next';
import DB from '../../../libs/database';
import User from '../../../schemas/IUser';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const { username, password, confirm } = req.body;

		if (!username || !password || !confirm) return resolve(res.status(400).json({ success: false, error: 'Missing fields' }));
		if (password !== confirm) return resolve(res.status(400).json({ success: false, error: 'Passwords do not match' }));

		DB(async () => {
			const user = await User.getUser(username);
			if (user) return resolve(res.status(400).json({ success: false, error: 'Username already taken' }));

			User.register(username, username, password)
				.then((newUser) => {
					console.log(newUser);
					resolve(res.status(200).json({ success: true }));
				})
				.catch((err) => {
					console.error(err);
					resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
				});
		});
	});
}
