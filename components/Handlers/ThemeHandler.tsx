'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
	theme: 'light',
	setTheme: (theme: string) => {},
});

function isLocalStorageAvailable() {
	var test = 'test';
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

export function useTheme() {
	return useContext(ThemeContext);
}

export default function ThemeHandler({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState(
		isLocalStorageAvailable()
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
