import './globals.css';

import { cookies } from 'next/headers';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import ModalHandler from '../components/ModalHandler';
import User from '../schemas/IUser';
import UserAuth from '../components/Modals/UserAuth';
import { Connect } from '../libs/database';
import UserHandler from '../components/UserHandler';
import ThemeProvider from '../components/ThemeHandler';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const token = cookies().get('token')?.value as string;

	await Connect();
	const user = await User.authenticate(token);
	const modal = !user ? <UserAuth mode={'SignIn'} /> : null;

	return (
		<ThemeProvider>
			<head />
			<body className='bg-white dark:bg-black'>
				<UserHandler>
					<ModalHandler modalOverride={modal}>
						<div className='parent w-screen h-screen flex'>
							<Navbar />
							<main className={'flex-1 overflow-y-auto'}>{children}</main>
							<Filters />
						</div>
					</ModalHandler>
				</UserHandler>
			</body>
		</ThemeProvider>
	);
}
