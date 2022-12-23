import { deleteCookie, getCookie, removeCookies } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Connect } from '../../../libs/database';
import User from '../../../schemas/IUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	return new Promise(async (resolve) => {
		await Connect();

		const {tags} = req.body;

        const tagArr = [];
        if (typeof tags ===)
	});
}
