import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageTemplate from '../components/PageTemplate';

export default function Page() {
	<PageTemplate name='Loading...'>
		<div className='flex justify-center items-center my-5'>
			<p className='text-black'>Loading...</p>{' '}
			<FontAwesomeIcon icon={faSpinner} size={'lg'} color={'black'} className={'animate-spin ml-3'} />
		</div>
	</PageTemplate>;
}
