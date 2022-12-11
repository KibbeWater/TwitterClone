'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
	theme: 'light',
	setTheme: (theme: string) => {},
});

export function useTheme() {
	return useContext(ThemeContext);
}

export default function ThemeHandler({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState(
		localStorage
			? localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: 'light'
	);

	useEffect(() => {
		if (localStorage) localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = (theme: string) => {
		setTheme(theme);
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
			<html lang='en' className={theme === 'dark' ? 'dark' : ''}>
				{children}
			</html>
		</ThemeContext.Provider>
	);
}
