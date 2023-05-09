import { ImageResponse, NextRequest } from 'next/server';

export const alt = 'About Acme';
export const size = {
	width: 500,
	height: 500,
};
export const contentType = 'image/png';
export const runtime = 'edge';

export default function handler(req: NextRequest) {
	// Get the /@tag from the URL
	const tag = req.headers.get('host')?.split('.')[0]?.replace('@', '');

	console.log(req.nextUrl);

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
