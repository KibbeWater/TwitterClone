export type IUser = {
	_id: Types.ObjectId;
	tag: string;
	username: string;
	password: string;
	verified: boolean;

	avatar?: string;
	banner?: string;
	bio: string;

	relationships: [Types.ObjectId];
	sessions: [Types.ObjectId];
	posts: [Types.ObjectId];
	likes: [Types.ObjectId];
	notifications: [Types.ObjectId];

	group: number;
};
