export default function PageTemplate({ children, name }: { children: React.ReactNode; name: string }) {
	return (
		<>
			<header className={'w-full h-12 px-3 sticky backdrop-blur-sm flex items-center bg-white/20'}>
				<h1 className={'font-bold m-0 text-black text-xl'}>{name}</h1>
			</header>
			{children}
		</>
	);
}
