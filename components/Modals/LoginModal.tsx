'use client';

import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { setCookie } from 'cookies-next';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { IUser } from '../../schemas/IUser';
import { ModalContext } from '../ModalHandler';

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
					setCookie('token', data.token);
					resolve(data.user);
				} else reject(data.error);
			})
			.catch((err) => {
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

	const btnLoginClick = () => {
		setLoading(true);

		Login(username, password)
			.then(() => {
				window.location.reload();
			})
			.catch((err) => {
				console.log(err);
				setError('Internal server error');
			});
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			setError('');
		}, 2500);

		return () => clearTimeout(timeout);
	}, [error]);

	return (
		<motion.div className='w-72 bg-white rounded-lg flex flex-col items-center'>
			<h1 className='m-0 font-bold text-4xl text-black'>Sign-In</h1>
			<p className='m-0 text-neutral-700'>Please sign in to continue</p>
			<div className='px-2 py-1 w-full flex flex-col items-center'>
				<input
					className='bg-slate-200 text-black mx-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'text'}
					placeholder={'Username'}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					className='bg-slate-200 text-black my-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
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
				<div className='h-px bg-slate-700 grow mx-4' />
				<p className='m-0 text-neutral-700'>OR</p>
				<div className='h-px bg-slate-700 grow mx-4' />
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
