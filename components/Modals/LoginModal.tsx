'use client';

import { useContext, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import axios from 'redaxios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { IUser } from '../../types/IUser';
import { ModalContext } from '../Handlers/ModalHandler';
import { UserContext } from '../Handlers/UserHandler';

type AuthProps = {
	switchMode: () => void;
};

function Login(username: string, password: string): Promise<IUser> {
	return new Promise((resolve, reject) => {
		axios
			.post<{ success: boolean; token: string; user: IUser; error: string }>('/api/user/login', { username, password })
			.then((res) => {
				const data = res.data;

				if (data.success) {
					resolve(data.user);
				} else reject(data.error);
			})
			.catch((err) => {
				console.error(err);
				reject(err);
			});
	});
}

export default function LoginModal({ switchMode }: AuthProps) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [hoveringLogin, setHoveringLogin] = useState(false);

	const { mutate } = useContext(UserContext);
	const { setModal } = useContext(ModalContext);

	const btnLoginClick = () => {
		setLoading(true);

		Login(username, password)
			.then(() => {
				if (mutate && setModal) {
					mutate();
					setModal(null);
				} else window.location.reload();
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
				setError((err.response?.data as any).error || 'An error occurred');
			});
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			setError('');
		}, 2500);

		return () => clearTimeout(timeout);
	}, [error]);

	return (
		<motion.div className='w-72 bg-white dark:bg-neutral-900 rounded-lg flex flex-col items-center'>
			<h1 className='m-0 font-bold text-4xl text-black dark:text-white'>Sign-In</h1>
			<p className='m-0 text-neutral-700 dark:text-neutral-200'>Please sign in to continue</p>
			<div className='px-2 py-1 w-full flex flex-col items-center'>
				<input
					className='bg-slate-200 dark:bg-neutral-700 text-black dark:text-white mx-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'text'}
					placeholder={'Username'}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					className='bg-slate-200 dark:bg-neutral-700 text-black dark:text-white my-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'password'}
					placeholder={'Password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<motion.button
				className='bg-accent-primary-500 border-0 rounded-md w-[70%] my-2 px-4 py-1 flex justify-center items-center font-semibold text-white disabled:cursor-default'
				whileHover={{ y: '-3px' }}
				onClick={btnLoginClick}
				onMouseEnter={() => setHoveringLogin(true)}
				onMouseLeave={() => setHoveringLogin(false)}
			>
				{error ? (
					error
				) : loading ? (
					<>
						{'Loading'} <FontAwesomeIcon icon={faSpinner} className='animate-spin ml-2' />
					</>
				) : (
					'Login'
				)}
			</motion.button>
			<div className='flex items-center w-full px-6'>
				<div className='h-px bg-slate-700 dark:text-slate-200 grow mx-4' />
				<p className='m-0 text-neutral-700 dark:text-neutral-200'>OR</p>
				<div className='h-px bg-slate-700 dark:text-slate-200 grow mx-4' />
			</div>
			<motion.button
				className='bg-accent-primary-500 border-0 rounded-md w-[70%] my-2 px-4 py-1 flex justify-center items-center font-semibold text-white disabled:cursor-default'
				whileHover={{ y: '-3px' }}
				onClick={() => switchMode()}
			>
				Create Account
			</motion.button>
		</motion.div>
	);
}
