import './globals.css';

import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import { AnalyticsWrapper } from '../components/AnalyticsWrapper';
import Filters from '../components/Filters';
import ModalHandler from '../components/Handlers/ModalHandler';
import ThemeProvider from '../components/Handlers/ThemeHandler';
import UserHandler from '../components/Handlers/UserHandler';
import UserAuth from '../components/Modals/UserAuth';
import Navbar from '../components/Navbar';
import { Connect } from '../libs/database';
import User from '../schemas/IUser';

/* export const metadata: Metadata = {
	title: 'Home',
	description: 'The social network by crackheads',
}; */

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
							<main className={'flex-1 overflow-y-auto scrollbar-hide'}>{children}</main>
							<Filters />
						</div>
					</ModalHandler>
				</UserHandler>
				<AnalyticsWrapper />
			</body>
		</ThemeProvider>
	);
}
