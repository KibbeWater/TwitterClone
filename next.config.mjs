import withBundleAnalyzer from "@next/bundle-analyzer";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,

    rewrites: async () => {
        return await new Promise((resolve) =>
            resolve([
                {
                    source: "/",
                    destination: "/home",
                },
            ]),
        );
    },

    images: {
        remotePatterns: [
            { protocol: "https", hostname: "*.googleusercontent.com" },
            { protocol: "https", hostname: "*.cloudfront.net" },
        ],
    },

    /**
     * If you are using `appDir` then you must comment the below `i18n` config out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
};

export default withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
})(config);
