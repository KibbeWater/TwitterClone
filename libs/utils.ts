export enum Group {
	'User' = 0,
	'Admin' = 1,
}

export function NormalizeObject<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

export function GenerateStorageKey() {
	return [...Array(32)]
		.map(() => (~~(Math.random() * 36)).toString(36))
		.join('')
		.toLowerCase();
}
