'use client';

import { createContext } from 'react';
import { IUser } from '../schemas/IUser';

export const UserContext = createContext<IUser | null>(null);

export default function UserHandler({ children, user }: { children?: React.ReactNode; user?: IUser | null }) {
	const usr = user || null;
	return <UserContext.Provider value={usr}>{children}</UserContext.Provider>;
}
