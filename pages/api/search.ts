import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../schemas/IUser';
import { TransformSafe } from '../../libs/user';

function GET(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		const { q } = req.query;

		if (q === undefined) resolve(res.status(400).json({ success: false, error: 'Missing query' }));

		User.find({ username: { $regex: q, $options: 'i' } }, {}, { limit: 10 })
			.then((users) => resolve(res.status(200).json({ success: true, users: users.map(TransformSafe).filter((u) => u) })))
			.catch((err) =>
				resolve(res.status(500).json({ success: false, error: 'Unexpected error occured whilst fetching query results' }))
			);
	});
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise((resolve) => {
		switch (req.method) {
			case 'GET':
				GET(req, res).then(resolve);
				break;
		}
	});
}
