import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import Verified from '../../../../components/Verified';
import User from '../../../../schemas/IUser';

export const config = {
	runtime: 'experimental-edge',
};

export default async function handle(req: NextRequest) {
	const { searchParams, origin } = req.nextUrl;
	const tag = searchParams.get('tag');
	const URL = `${origin}`;

	return new ImageResponse(
		(
			<div
				style={{
					width: 480,
					height: 220,
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: '#FFF',
					borderRadius: 10,
				}}
			>
				<div
					style={{
						width: '100%',
						paddingBottom: '33.3%',
						position: 'relative',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<div style={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto' }}>
						<img
							src={`${URL}/api/user/${tag}/banner`}
							style={{
								height: '100%',
								width: '100%',
								borderTopRightRadius: 10,
								borderTopLeftRadius: 10,
								objectFit: 'cover',
							}}
						/>
					</div>
					<img
						src={`${URL}/api/user/${tag}/avatar`}
						style={{
							position: 'absolute',
							bottom: -50,
							left: 10,
							width: 100,
							height: 100,
							borderRadius: 9999,
							border: '4px solid #FFF',
						}}
					/>
				</div>
				<div style={{ display: 'flex' }}>
					<div style={{ marginLeft: 120, marginTop: 5, display: 'flex', flexDirection: 'column' }}>
						<div style={{ display: 'flex' }}>
							<p style={{ color: '#000', fontWeight: 'bolder', margin: 0, lineHeight: 1, alignItems: 'center' }}>
								KibbeWater
								<svg
									viewBox='0 0 24 24'
									aria-label='Verified account'
									role='img'
									width={15}
									height={15}
									style={{ marginLeft: 2 }}
								>
									<g>
										<path
											fill={'red'}
											d='M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z'
										/>
									</g>
								</svg>
							</p>
						</div>
						<p style={{ color: '#333', fontWeight: 'bolder', margin: 0, lineHeight: 1, fontSize: 12 }}>@Snow</p>
					</div>
				</div>
			</div>
		),
		{ width: 480, height: 220 }
	);
}
