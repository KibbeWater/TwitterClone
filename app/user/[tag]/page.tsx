import PageTemplate from '../../../components/PageTemplate';

type Props = {
	params: {
		tag: string;
	};
};

export default function Page({ params }: Props) {
	params.tag = params.tag.replace('%40', '');

	return (
		<PageTemplate name={params.tag}>
			<h1>Hey</h1>
		</PageTemplate>
	);
}
