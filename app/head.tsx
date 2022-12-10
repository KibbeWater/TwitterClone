export default function Head() {
	return (
		<>
			<title>Twatter</title>
			<meta content='width=device-width, initial-scale=1' name='viewport' />
			<meta name='description' content='Not Twitter' />
			<meta property='og:title' content='Twatter' />
			<meta property='og:url' content='https://twatter-kibbewater.vercel.app/home' />
			<meta property='og:description' content='Definitely not a Twitter clone' />
			<meta property='og:type' content='website' />
			<meta property='og:image' content='/assets/favicons/icon-512x512.png' />
			<meta name='theme-color' content='#f01d1d' />
			<link rel='icon' href='/favicon.ico' />
			<link rel='shortcut icon' href='/assets/favicons/icon-192x192.png' />
			<link rel='apple-touch-icon' href='/assets/favicons/icon-192x192.png' />
			<link rel='manifest' href='manifest.json' />
		</>
	);
}
