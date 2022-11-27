'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type AuthProps = {
	switchMode: () => void;
};

function Register(username: string, password: string, confirm: string) {
	return new Promise((resolve, reject) => {
		if (password !== confirm) return reject('Password does not match');

		axios
			.post<{ success: boolean; token: string }>('/api/user/register', {
				username,
				password,
				confirm,
			})
			.then((res) => {
				const data = res.data;
			});
	});
}

export default function RegisterModal({ switchMode }: AuthProps) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	return (
		<motion.div className='w-72 bg-white rounded-lg flex flex-col items-center'>
			<h1 className='m-0 font-bold text-4xl text-black'>Register</h1>
			<p className='m-0 text-neutral-700'>Please sign up to continue</p>
			<div className='px-2 py-1 w-full flex flex-col items-center'>
				<input
					className='bg-slate-200 mx-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'text'}
					placeholder={'Username'}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					className='bg-slate-200 my-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'password'}
					placeholder={'Password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<input
					className='bg-slate-200 mx-1 px-1 py-2 w-9/12 text-sm border-0 rounded-md outline-none'
					type={'password'}
					placeholder={'Confirm Password'}
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
				/>
			</div>
			<motion.button
				className='bg-accent-primary-500 border-0 rounded-md w-[70%] my-2 px-4 py-1 flex justify-center items-center font-semibold text-white disabled:cursor-default'
				whileHover={{ y: '-3px' }}
			>
				{error ? (
					error
				) : loading ? (
					<>
						{'Loading'} <FontAwesomeIcon icon={faSpinner} className='animate-spin ml-2' />
					</>
				) : (
					'Register'
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
				Sign In
			</motion.button>
		</motion.div>
	);
}
