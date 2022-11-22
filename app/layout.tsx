import Navbar from '../components/Navbar';

import './globals.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head />
			<body className={'bg-white'}>
				<div id='modal_root'></div>
				<div className='parent w-screen h-screen flex'>
					<Navbar />
					<main className={'min-w-[45%] max-w-[50%]'}>{children}</main>
					<div className='filters'>
						<div className='filters__container'>
							<div className='searchbar'>
								<div className='searchbar__result'>
									<p className='searchbar__result_hint'>Try searching for people, topics or keywords</p>
								</div>
								<div className='searchbar__search'>
									<i className='fa-solid fa-magnifying-glass'></i>
								</div>
								<div style={{ width: '100%', height: '100%' }}>
									<input type='text' className='searchbar__input' placeholder='Search Twatter' />
								</div>
							</div>
							<section className='trends'>
								<div className='trends__header'></div>
							</section>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
