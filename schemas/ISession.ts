import { Model, model, Schema, Types } from 'mongoose';

const MAX_SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 1 week

export interface ISession {
	_id: Types.ObjectId;
	owner?: Types.ObjectId;
	token: string;
	date: number;
	ip?: string;
}

interface SessionModel extends Model<ISession> {
	createSession: (owner?: Types.ObjectId, ip?: string) => Promise<ISession>;
}

const sessionSchema = new Schema<ISession, SessionModel>(
	{
		owner: { type: Types.ObjectId, ref: 'User' },
		token: { type: String, required: true, unique: true },
		date: { type: Number, required: true },
		ip: { type: String, required: false },
	},
	{
		methods: {
			isValid: function () {
				const isValid = this.date + MAX_SESSION_AGE > Date.now();
				if (!isValid) this.delete();
				return isValid;
			},
		},
		statics: {
			createSession: function (owner?: Types.ObjectId, ip?: string) {
				const token = Buffer.from([...Array(32)].map(() => (~~(Math.random() * 36)).toString(36)).join('')).toString('base64');
				const date = Date.now();
				return this.create({ owner, token, date, ip });
			},
		},
	}
);

const Session = model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
