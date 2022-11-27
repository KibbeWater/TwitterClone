import { model, Schema, Types } from 'mongoose';

const MAX_SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 1 week

interface ISession {
	owner?: Types.ObjectId;
	token: string;
	date: number;
	ip: string;
}

const sessionSchema = new Schema<ISession>(
	{
		owner: { type: Types.ObjectId, ref: 'User' },
		token: { type: String, required: true, unique: true },
		date: { type: Number, required: true },
		ip: { type: String, required: true },
	},
	{
		methods: {
			isValid: function () {
				return this.date + MAX_SESSION_AGE > Date.now();
			},
		},
	}
);

const Session = model<ISession>('Session', sessionSchema);

export default Session;
