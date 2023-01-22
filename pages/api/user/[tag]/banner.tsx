import axios from 'redaxios';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../../libs/database';
import User from '../../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { tag } = req.query;

	await Connect();

	const user = await User.findOne({ tag: { $regex: new RegExp(`^${tag}`, 'i') } }).exec();

	if (!user) {
		return res.status(404).json({
			error: 'User not found',
		});
	}

	// Get the user.avatar and return the image data
	axios
		.get(user.banner || '', {
			responseType: 'arrayBuffer',
		})
		.then((response) => {
			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': response.data.length,
			});
			res.end(Buffer.from(response.data, 'binary'));
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({
				error: 'Internal server error',
			});
		});
}
