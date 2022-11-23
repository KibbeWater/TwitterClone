import { connect, Mongoose } from 'mongoose';

let connected = false;
let connection: Mongoose | null = null;
let connectionPromise: Promise<Mongoose> | null = null;

function Connect() {
	if (connectionPromise) return connectionPromise;

	const promise = new Promise<Mongoose>((resolve, reject) => {
		if (!process.env.MONGO_URL) return reject(new Error('Missing MONGO_URL env variable'));
		const connectURL = process.env.MONGO_URL;

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

export default async function Run(code: () => void) {
	await Connect();
	code();
}
