import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import PageTemplate from '../components/PageTemplate';

export default function Page() {
	<PageTemplate name='Loading...'>
		<div className='flex justify-center items-center my-5'>
			<p className='text-black dark:text-white'>Loading...</p>{' '}
			<FontAwesomeSvgIcon icon={faSpinner} size={'lg'} className={'animate-spin ml-3 text-black dark:text-white'} />
		</div>
	</PageTemplate>;
}
