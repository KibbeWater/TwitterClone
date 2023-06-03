'use client';

import { useContext, useEffect, useState } from 'react';
import axios from 'redaxios';

import { UserContext } from '../../components/Handlers/UserHandler';
import Notification from '../../components/Notification';
import PageTemplate from '../../components/PageTemplate';
import { INotification } from '../../types/INotification';

export default function Page() {
	const [notifications, setNotifications] = useState<INotification[]>([]);

	const { user, mutate } = useContext(UserContext);

	useEffect(() => {
		if (user) {
			const notifs = user.notifications as unknown as INotification[];
			setNotifications(notifs);
		}
	}, [user]);

	useEffect(() => {
		axios.post('/api/notifications/read').then(() => {
			if (mutate) mutate();
		});
	}, []);

	return (
		<PageTemplate name='Notifications'>
			{notifications.map((notification, index) => (
				<Notification key={`notification-${index}`} notif={notification} />
			))}
		</PageTemplate>
	);
}
