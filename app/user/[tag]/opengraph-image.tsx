import { ImageResponse, NextRequest } from 'next/server';
import User, { IUser } from '../../../schemas/IUser';

export const alt = 'Profile Image';
export const size = {
	width: 512,
	height: 512,
};
export const contentType = 'image/png';
export const runtime = 'edge';

export default async function handler(req: NextRequest) {
	// Get the /@tag from the URL
	const tag = req.headers.get('host')?.split('.')[0]?.replace('@', '');
	// Example output: url = 'https://twatter.kibbewater.com/@kibbe' => tag = 'kibbe'

	// const user = (await User.find({ tag })) as IUser[];

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 128,
					background: 'white',
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				About Acme
			</div>
		),
		{
			...size,
		}
	);
}
