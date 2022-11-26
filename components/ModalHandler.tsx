'use client';
import React from 'react';

import { useModal } from '../libs/modal';

export default function ModalHandler({ children }: { children?: React.ReactNode }) {
	const modal = useModal();

	return (
		<div
			className={`w-screen h-screen absolute z-50 flex justify-center items-center transition-all ${
				modal == null ? 'backdrop-blur-0 bg-transparent hidden' : 'backdrop-blur-sm bg-black/50 block'
			}`}
		>
			{modal}
		</div>
	);
}
