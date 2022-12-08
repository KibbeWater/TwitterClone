'use client';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../components/Handlers/UserHandler';
import Notification from '../../components/Notification';
import PageTemplate from '../../components/PageTemplate';
import { INotification } from '../../schemas/INotification';

export default function Page() {
	const [notifications, setNotifications] = useState<INotification[]>([]);

	const { user } = useContext(UserContext);

	useEffect(() => {
		if (user) {
			const notifs = user.notifications as unknown as INotification[];
			setNotifications(notifs);
		}
	}, [user]);

	return (
		<PageTemplate name='Notifications'>
			{notifications.map((notification, index) => (
				<Notification key={`notification-${index}`} notif={notification} />
			))}
		</PageTemplate>
	);
}
