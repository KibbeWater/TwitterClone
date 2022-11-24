/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},

	redirects: async () => {
		return [
			{
				source: '/',
				destination: '/home',
				permanent: true,
			},
		];
	},

	rewrites: async () => {
		return [
			{
				source: '/:tag(@.*)',
				destination: '/user/:tag',
			},
		];
	},

	reactStrictMode: true,
};

module.exports = nextConfig;
