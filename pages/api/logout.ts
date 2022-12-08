import { deleteCookie, getCookie, removeCookies } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../libs/database';
import User from '../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		await Connect();

		const token = getCookie('token', { req, res }) as string;
		if (!token) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const user = await User.authenticate(token);
		if (!user) return resolve(res.status(401).json({ success: false, error: 'Unauthorized' }));

		const dbUser = new User(user);
		dbUser
			.logout(token)
			.then(() => {
				deleteCookie('token', { req, res });
				resolve(res.redirect('/'));
			})
			.catch((err) => {
				resolve(res.status(500).json({ success: false, error: 'Internal server error' }));
			});
	});
}
