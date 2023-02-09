import User from '../../../schemas/IUser';

type Props = {
	params: {
		tag: string;
	};
};

export default async function Head({ params }: Props) {
	const tag = params.tag.replace('%20', '');

	const user = await User.findOne({ username: tag });

	if (!user)
		return (
			<>
				<title>Twatter</title>
				<meta content='width=device-width, initial-scale=1' name='viewport' />
				<meta name='description' content='Not Twitter' />
			</>
		);

	return (
		<>
			<title>Twatter</title>
			<meta content='width=device-width, initial-scale=1' name='viewport' />
			<meta name='description' content='Not Twitter' />

			<meta property='og:site_name' content='Twatter' />
			<meta property='og:url' content={'https://twatter-kibbewater.vercel.app/user/@' + tag} />
			<meta property='og:image' content='https://twatter-kibbewater.vercel.app/assets/favicons/icon-512x512.png' />

			{/* Create OG meta tags to describe the user profile */}
			<meta property='og:description' content={user?.bio} />
			<meta property='og:title' content={`${user?.username} on Twatter`} />
			<meta property='og:image' content={user?.avatar} />
			<meta property='og:image:alt' content={user?.username} />
			<meta property='og:type' content='profile' />

			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:site' content='@kibbewater' />
			<meta name='twitter:creator' content='@kibbewater' />
			<meta name='twitter:title' content='Twatter' />
			<meta name='twitter:description' content={user?.bio} />
			<meta name='twitter:image' content={user?.avatar} />

			<meta name='theme-color' content='#f01d1d' />

			<link rel='icon' href='https://twatter-kibbewater.vercel.app/favicon.ico' />
			<link rel='shortcut icon' href='https://twatter-kibbewater.vercel.app/assets/favicons/icon-192x192.png' />
			<link rel='apple-touch-icon' href='https://twatter-kibbewater.vercel.app/assets/favicons/icon-192x192.png' />
			<link rel='manifest' href='manifest.json' />
		</>
	);
}
