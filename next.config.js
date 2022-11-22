const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

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
};

module.exports = async (phase, { defaultConfig }) => {
	if (phase === PHASE_DEVELOPMENT_SERVER) {
		return {
			...nextConfig,
			env: {
				...require('./env.json'),
			},
			reactStrictMode: true,
		};
	}

	return { ...nextConfig, reactStrictMode: true };
};
