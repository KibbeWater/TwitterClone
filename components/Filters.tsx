'use client';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { SafeUser } from '../libs/user';
import UserEntry from './UserEntry';

export default function Filters() {
	const [active, setActive] = useState(false);
	const [search, setSearch] = useState('');

	const [results, setResults] = useState([] as SafeUser[]);

	const isActive = active || search.length > 0 || results.length > 0;

	useEffect(() => {
		const controller = new AbortController();
		if (search.length === 0) return setResults([]);
		else
			import('axios').then((pkg) => {
				pkg.default
					.get<{ success: boolean; error?: string; users: SafeUser[] }>(`/api/search?q=${search}`, { signal: controller.signal })
					.then((res) => {
						if (!res.data.success) return console.error(res.data.error);
						setResults(res.data.users);
						console.log(res.data.users);
					})
					.catch((err) => {});
			});
		return () => controller.abort();
	}, [search]);

	return (
		<div className={'h-full w-[37%] border-l-[1px] border-gray-700 hidden lg:block'}>
			<div className={'h-full w-[70%] ml-8 pt-1'}>
				<div
					className={`w-full h-10 rounded-3xl mb-2 flex items-center ${
						isActive ? 'bg-white dark:bg-black' : 'bg-[#eff3f4] dark:bg-neutral-800'
					} ${isActive ? 'border-[#e26161]' : 'border-transparent'} border-[1px]`}
				>
					<div
						className={`${isActive ? 'flex' : 'hidden'} absolute top-11 w-80 ${
							results.length === 0 ? 'h-24 justify-center ' : 'flex-col '
						} bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl overflow-hidden`}
					>
						{results.length !== 0 ? (
							results.map((user, i) => (
								<UserEntry
									user={user}
									key={`search-result-${user._id}`}
									onClick={() => window.location.assign(`/@${user.tag}`)}
								/>
							))
						) : (
							<p className={'text-zinc-400 text-sm text-center mt-3'}>Try searching for people, topics or keywords</p>
						)}
					</div>
					<div className={'mx-5'}>
						<FontAwesomeSvgIcon icon={faMagnifyingGlass} className='text-black dark:text-white' />
					</div>
					<div className={'w-full h-full'}>
						<input
							type='text'
							onBlur={() => setActive(false)}
							onFocus={() => setActive(true)}
							onChange={(e) => setSearch(e.target.value)}
							value={search}
							className={`w-full h-full ${
								isActive ? 'bg-white dark:bg-black' : 'bg-[#eff3f4] dark:bg-neutral-800'
							} text-sm outline-none rounded-r-3xl text-black dark:text-white`}
							placeholder='Search Twatter'
						/>
					</div>
				</div>
				<section className='trends'>
					<div className='trends__header'></div>
				</section>
			</div>
		</div>
	);
}
