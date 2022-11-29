'use client';
import React, { createContext, useEffect, useState } from 'react';

export const ModalContext = createContext<{
	modal?: React.ReactNode;
	setModal?: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}>({});

export default function ModalHandler({ children, modalOverride }: { children?: React.ReactNode; modalOverride?: React.ReactNode }) {
	const [modal, setModal] = useState<React.ReactNode>(null);

	useEffect(() => {
		setModal(modalOverride);
	}, [modalOverride]);

	const value = { modal, setModal };

	return (
		<ModalContext.Provider value={value}>
			<div
				className={`w-screen h-screen absolute z-50 flex justify-center items-center transition-all ${
					modal == null ? 'backdrop-blur-0 bg-transparent hidden' : 'backdrop-blur-sm bg-black/50 block'
				}`}
			>
				{modal}
			</div>
			{children}
		</ModalContext.Provider>
	);
}
