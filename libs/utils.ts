export function NormalizeObject<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
