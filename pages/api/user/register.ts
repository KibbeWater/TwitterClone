import type { NextApiRequest, NextApiResponse } from 'next';
import DB from '../../../libs/database';
import User from '../../../schemas/IUser';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		if (req.method !== 'POST') return resolve(res.status(405).json({ success: false, error: 'Method not allowed' }));

		const { username, password, confirm } = req.body;

		if (!username || !password || !confirm) return resolve(res.status(400).json({ success: false, error: 'Missing fields' }));
		if (password !== confirm) return resolve(res.status(400).json({ success: false, error: 'Passwords do not match' }));

		let newUsername = username;
		if (newUsername.length > 32) newUsername = newUsername.slice(0, 32);

		DB(async () => {
			const user = await User.getUser(username);
			if (user) return resolve(res.status(400).json({ success: false, error: 'Username already taken' }));

			User.register(username.toLowerCase(), username, password)
				.then((newUser) => {
					if (!newUser) return resolve(res.status(500).json({ success: false, error: 'Failed to create user' }));

					new User(newUser).authorize().then((session) => {
						if (!session) return resolve(res.status(500).json({ success: false, error: 'Failed to create session' }));
						resolve(res.status(200).json({ success: true, token: session.token }));
					});
				})
				.catch((err) => {
					console.error(err);
					resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
				});
		});
	});
}
