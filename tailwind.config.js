/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				accent: {
					primary: {
						400: 'rgb(219, 27, 27)',
						500: 'rgb(240, 29, 29)',
					},
				},
			},
		},
	},
	plugins: [],
};
