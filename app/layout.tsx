import './globals.css';

import { cookies } from 'next/headers';
import { createContext } from 'react';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import ModalHandler from '../components/ModalHandler';
import User, { IUser } from '../schemas/IUser';
import UserAuth from '../components/Modals/UserAuth';
import { Connect } from '../libs/database';
import UserHandler from '../components/UserHandler';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const token = cookies().get('token')?.value as string;

	await Connect();
	const user = await User.authenticate(token);
	const modal = !user ? <UserAuth mode={'SignIn'} /> : null;

	return (
		<html lang='en'>
			<head />
			<body className={'bg-white'}>
				<UserHandler user={user}>
					<ModalHandler modalOverride={modal}>
						<div className='parent w-screen h-screen flex'>
							<Navbar />
							<main className={'grow'}>{children}</main>
							<Filters />
						</div>
					</ModalHandler>
				</UserHandler>
			</body>
		</html>
	);
}
