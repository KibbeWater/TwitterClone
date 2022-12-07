'use client';

import { createContext } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { IPost } from '../../schemas/IPost';
import { IRelationship } from '../../schemas/IRelationship';
import { ISession } from '../../schemas/ISession';
import { IUser } from '../../schemas/IUser';

export const UserContext = createContext<{
	user?: LocalUser;
	mutate?: KeyedMutator<{
		success: boolean;
		user: LocalUser;
	}>;
}>({});

export type LocalUser = IUser & {
	sessions: ISession[];
	posts: (IPost & { user: IUser; quote?: IPost & { user: IUser } })[];
	relationships: IRelationship[];
};

export default function UserHandler({ children }: { children?: React.ReactNode }) {
	const { data, mutate } = useSWR<{ success: boolean; user: LocalUser }>(`/api/user`, (url) => fetch(url).then((r) => r.json()));

	const user = data?.user;

	return <UserContext.Provider value={{ user, mutate }}>{children}</UserContext.Provider>;
}
