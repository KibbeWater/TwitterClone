import { MetadataRoute } from 'next';
import { Connect } from '../libs/database';
import Post from '../schemas/IPost';
import { IPost } from '../types/IPost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	await Connect();

	//const users = (await User.find({})) as IUser[];
	const posts = (await Post.find({})) as IPost[];

	return [
		{
			url: 'https://twatter.kibbewater.com/home',
			lastModified: new Date(),
		},
		...posts.map((post) => {
			return {
				url: `https://twatter.kibbewater.com/post/${post._id}`,
				lastModified: new Date(post.date),
			};
		}),
	];
}
