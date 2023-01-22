export type IPost = {
	_id: string;
	user?: string;

	content: string;
	quote?: string;
	images?: string[];
	parent?: string;

	comments: [string];
	likes: [string];
	retwaats: [string];
	mentions: [string];

	date: number;
};
