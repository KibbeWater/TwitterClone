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
			{
				source: '/user/:tag/card',
				destination: '/api/user/:tag/card',
			},
		];
	},

	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: '*.amazonaws.com' },
			{ protocol: 'https', hostname: '*.cloudfront.net' },
		],
	},

	reactStrictMode: true,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

module.exports = (phase, defaultConfig) => {
	return withBundleAnalyzer(nextConfig);
};
