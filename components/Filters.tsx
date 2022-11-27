'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Filters() {
	const [active, setActive] = useState(false);

	return (
		<div className={'h-full w-[37%] border-l-[1px] border-gray-700 hidden lg:block'}>
			<div className={'h-full w-[70%] ml-8 pt-1'}>
				<div
					className={`w-full h-10 rounded-3xl mb-2 flex items-center ${active ? 'bg-white' : 'bg-[#eff3f4]'} ${
						active ? 'border-[#e26161]' : 'border-transparent'
					} border-[1px]`}
				>
					<div
						className={`${
							active ? 'flex' : 'hidden'
						} absolute top-11 w-80 h-24 py-3 bg-white shadow-2xl rounded-2xl justify-center`}
					>
						<p className={'text-zinc-400 text-sm text-center'}>Try searching for people, topics or keywords</p>
					</div>
					<div className={'mx-5'}>
						<FontAwesomeIcon icon={faMagnifyingGlass} color={'black'} />
					</div>
					<div className={'w-full h-full'}>
						<input
							type='text'
							onBlur={() => setActive(false)}
							onFocus={() => setActive(true)}
							className={`w-full h-full ${active ? 'bg-white' : 'bg-[#eff3f4]'} text-sm outline-none rounded-r-3xl`}
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
