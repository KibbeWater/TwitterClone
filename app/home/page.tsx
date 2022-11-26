import PageTemplate from '../../components/PageTemplate';
import TextAutosize from '../../components/TextAutosize';

export default function Page() {
	return (
		<PageTemplate name='Home'>
			<div className='flex w-full px-5 pb-4 bg-white relative z-10 border-b-[1px] border-gray-700'>
				<div>
					<h1>Img here</h1>
				</div>
				<div className='flex flex-col px-5 w-full'>
					<TextAutosize
						minRows={1}
						placeholder={"What's happening?"}
						className={'w-full outline-none border-0 mb-4 resize-none text-xl bg-transparent'}
					/>
					<div className='h-px w-full opacity-50 bg-gray-900' />
				</div>
			</div>
		</PageTemplate>
	);
}
