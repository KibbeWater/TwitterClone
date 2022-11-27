import './globals.css';

import { cookies } from 'next/headers';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import ModalHandler from '../components/ModalHandler';
import User from '../schemas/IUser';
import { showModal } from '../libs/modal';
import UserAuth from '../components/Modals/UserAuth';
import { Connect } from '../libs/database';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const token = cookies().get('token')?.value as string;

	await Connect();
	const user = await User.authenticate(token);
	const modal = !user ? <UserAuth mode={'SignIn'} /> : null;
	console.log(user);

	return (
		<html lang='en'>
			<head />
			<body className={'bg-white'}>
				<ModalHandler modalOverride={modal} />
				<div className='parent w-screen h-screen flex'>
					<Navbar />
					<main className={'grow'}>{children}</main>
					<Filters />
				</div>
			</body>
		</html>
	);
}
