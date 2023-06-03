'use client';

import { createContext } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { IPost } from '../../types/IPost';
import { IRelationship } from '../../types/IRelationship';
import { ISession } from '../../types/ISession';
import { IUser } from '../../types/IUser';

export const UserContext = createContext<{
	user?: LocalUser;
	mutate?: KeyedMutator<{
		success: boolean;
		data: LocalUser;
	}>;
}>({});

export type LocalUser = IUser & {
	sessions: ISession[];
	posts: (IPost & { user: IUser; quote?: IPost & { user: IUser } })[];
	relationships: IRelationship[];
};

export default function UserHandler({ children }: { children?: React.ReactNode }) {
	const { data, mutate } = useSWR<{ success: boolean; data: LocalUser }>(`/api/user`, (url) => fetch(url).then((r) => r.json()));

	const user = data?.data;

	return <UserContext.Provider value={{ user, mutate }}>{children}</UserContext.Provider>;
}
