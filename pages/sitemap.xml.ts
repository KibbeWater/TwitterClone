import { GetServerSideProps } from 'next';

import { Connect } from '../libs/database';
import User from '../schemas/IUser';
import Post from '../schemas/IPost';
import { IPost } from '../types/IPost';
import { IUser } from '../types/IUser';

const EXTERNAL_DATA_URL = 'https://jsonplaceholder.typicode.com/posts';

function generateSiteMap(domain: string, posts: IPost[]) {
	return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://${domain}/home</loc>
     </url>
     ${posts
			.map((post) => {
				return `
         <url>
           <loc>https://${domain}/post/${post._id}</loc>
           <lastmod>${post.date}</lastmod>
         </url>
       `;
			})
			.join('')}
   </urlset>
 `;
}

export const getServerSideProps: GetServerSideProps<{}> = async ({ req, res }) => {
	const domain = req.headers.host;

	if (!domain) {
		res.statusCode = 400;
		res.end();
		return {
			props: {},
		};
	}

	await Connect();

	//const users = (await User.find({})) as IUser[];
	const posts = (await Post.find({})) as IPost[];

	// We make an API call to gather the URLs for our site
	/* const request = await fetch(EXTERNAL_DATA_URL);
	const posts = await request.json(); */

	// We generate the XML sitemap with the posts data
	const sitemap = generateSiteMap(domain, posts);

	res.setHeader('Content-Type', 'text/xml');
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
};

function SiteMap() {}

export default SiteMap;
