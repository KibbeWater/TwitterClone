import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import ModalHandler from '../components/ModalHandler';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head />
			<body className={'bg-white'}>
				<ModalHandler />
				<div className='parent w-screen h-screen flex'>
					<Navbar />
					<main className={'grow'}>{children}</main>
					<Filters />
				</div>
			</body>
		</html>
	);
}
