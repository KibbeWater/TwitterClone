'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

function AuthBase({ children }: { children?: React.ReactNode }) {
	return (
		<AnimatePresence mode={'wait'}>
			<motion.div
				className='w-72 py-4 flex flex-col items-center bg-slate-50 rounded-md'
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -10, opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}

type Props = {
	mode: 'SignIn' | 'SignUp';
};

function swapMode(prev: 'SignIn' | 'SignUp') {
	return prev === 'SignIn' ? 'SignUp' : 'SignIn';
}

export default function UserAuth({ mode }: Props) {
	const [stateMode, setMode] = useState(mode);

	let content: React.ReactNode = null;

	console.log('Mode: ' + stateMode);

	switch (mode) {
		case 'SignIn':
			content = <LoginModal switchMode={() => setMode(swapMode)} />;
			break;
		case 'SignUp':
			content = <RegisterModal switchMode={() => setMode(swapMode)} />;
			break;
	}

	return <AuthBase>{content}</AuthBase>;
}
