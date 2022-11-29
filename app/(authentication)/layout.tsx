import React from 'react';

export default function Layout({ children }: { children?: React.ReactNode }) {
	return (
		<html lang='en'>
			<head />
			<body className={'bg-white'}>
				<main className={'flex justify-center items-center'}>{children}</main>
			</body>
		</html>
	);
}
