import { connect, Mongoose } from 'mongoose';

let connected = false;
let connection: Mongoose | null = null;
let connectionPromise: Promise<Mongoose> | null = null;

export function Connect() {
	if (connectionPromise) return connectionPromise;

	const promise = new Promise<Mongoose>((resolve, reject) => {
		if (!process.env.MONGO_URI) return reject(new Error('Missing MONGO_URI env variable'));
		const connectURL = process.env.MONGO_URI;

		connect(connectURL)
			.then((db) => {
				connected = true;
				connection = db;
				resolve(db);
			})
			.catch(reject);
	});
	connectionPromise = promise;

	return promise;
}

export default async function DB(code: () => void) {
	await Connect();
	code();
}
