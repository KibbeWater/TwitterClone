import { Connect } from '../../../libs/database';
import Post from '../../../schemas/IPost';
import { IUser } from '../../../types/IUser';

type Props = {
	params: {
		id: string;
	};
};

export default async function Head({ params }: Props) {
	await Connect();
	const post = await Post.findOne({ _id: params.id }).populate('user');

	const user = post?.user as IUser | undefined;

	return (
		<>
			<title>Twatter</title>
			<meta content='width=device-width, initial-scale=1' name='viewport' />
			<meta name='description' content='Not Twitter' />

			<meta property='og:site_name' content='Twatter' />
			<meta property='og:url' content={'https://twatter-kibbewater.vercel.app/post/' + params.id} />
			<meta property='og:image' content='https://twatter-kibbewater.vercel.app/assets/favicons/icon-512x512.png' />

			{/* Create OG meta tags to describe the post, treat this as an article */}
			<meta property='og:description' content={post?.content} />
			<meta property='og:title' content={`${user?.username} on Twatter`} />
			<meta property='og:image' content={user?.avatar} />
			<meta property='og:image:alt' content={user?.username} />
			<meta property='og:type' content='article' />

			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:site' content='@kibbewater' />
			<meta name='twitter:creator' content='@kibbewater' />
			<meta name='twitter:title' content='Twatter' />
			<meta name='twitter:description' content={post?.content} />
			<meta name='twitter:image' content={user?.avatar} />

			<meta name='theme-color' content='#f01d1d' />

			<link rel='icon' href='https://twatter-kibbewater.vercel.app/favicon.ico' />
			<link rel='shortcut icon' href='https://twatter-kibbewater.vercel.app/assets/favicons/icon-192x192.png' />
			<link rel='apple-touch-icon' href='https://twatter-kibbewater.vercel.app/assets/favicons/icon-192x192.png' />
			<link rel='manifest' href='manifest.json' />
		</>
	);
}
