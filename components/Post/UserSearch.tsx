'use strict';
import axios from 'redaxios';
import useSWR from 'swr';
import { SafeUser } from '../../libs/user';

function UserItem({ user }: { user: SafeUser }) {
	return <p>{user.username}</p>;
}

type UserSearchResult = { success: boolean; users: SafeUser[]; error?: string };

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export default function UserSearch({ search }: { search: string }) {
	const { data, error, isValidating } = useSWR<UserSearchResult>(`/api/users?search=${search}`, fetcher);

	const users = data?.users || [];

	if (!search) return null;
	return (
		<div className='absolute top-0 left-0'>
			{error && <div>Failed to load</div>}
			{isValidating && <div>Loading...</div>}
			{data && users.map((user: SafeUser, idx: number) => <UserItem key={`usrsrc-${idx}`} user={user} />)}
		</div>
	);
}
