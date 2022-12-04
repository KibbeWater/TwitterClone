import mongoose, { Model, model, Schema, Types } from 'mongoose';

const MAX_SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 1 week

export interface ISession {
	_id: Types.ObjectId;
	owner?: Types.ObjectId;
	token: string;
	date: number;
	ip?: string;
}

interface ISessionMethods {
	isValid: () => Promise<boolean>;
}

interface SessionModel extends Model<ISession, {}, ISessionMethods> {
	createSession: (owner?: Types.ObjectId, ip?: string) => Promise<ISession>;
	getSession: (token: string) => Promise<ISession | null>;
	removeSession: (token: string) => Promise<void>;
}

const sessionSchema = new Schema<ISession, SessionModel, ISessionMethods>(
	{
		owner: { type: Types.ObjectId, ref: 'User' },
		token: { type: String, required: true, unique: true },
		date: { type: Number, required: true },
		ip: { type: String, required: false },
	},
	{
		statics: {
			createSession: function (owner?: Types.ObjectId, ip?: string) {
				const token = Buffer.from([...Array(32)].map(() => (~~(Math.random() * 36)).toString(36)).join('')).toString('base64');
				const date = Date.now();
				return this.create({ owner, token, date, ip });
			},

			getSession: function (token: string) {
				return new Promise<ISession | null>((resolve, reject) => {
					const session = this.findOne({ token }).populate('owner').exec();
					new Session(session).isValid().then((valid) => {
						if (!valid) resolve(null);
						else resolve(session);
					});
				});
			},

			removeSession: function (token: string) {
				return this.deleteOne({ token }).exec();
			},
		},
	}
);

sessionSchema.methods.isValid = function () {
	return new Promise<boolean>((resolve, reject) => {
		if (this.date + MAX_SESSION_AGE < Date.now()) {
			this.deleteOne().exec();
			resolve(false);
		} else {
			resolve(true);
		}
	});
};

// Fix recompilation error
const Session = (mongoose.models.Session as SessionModel) || model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
