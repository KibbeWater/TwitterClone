export default function PageTemplate({ children, name }: { children: React.ReactNode; name: string }) {
	return (
		<>
			<header className={'w-full h-12 px-3 sticky backdrop-blur-sm flex items-center bg-white opacity-20'}>
				<h1 className={'font-bold m-0'}>{name}</h1>
			</header>
			{children}
		</>
	);
}
