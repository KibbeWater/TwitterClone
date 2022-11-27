import { Model, model, Schema, Types } from 'mongoose';
import { compareSync, hashSync } from 'bcryptjs';
import Session, { ISession } from './ISession';

interface IUser {
	tag: string;
	username: string;
	password: string;

	avatar?: string;
	banner?: string;
	bio: string;

	sessions: [Types.ObjectId];

	group: number;
}

interface IUserMethods {
	authorize: () => Promise<ISession>;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
	getUser: (tag: string) => Promise<IUser | null>;
	register: (tag: string, username: string, password: string) => Promise<IUser | null>;
	authorize: (tag: string, password: string) => Promise<IUser | null>;
	authenticate: (token: string) => Promise<IUser | null>;
}

export const userSchema = new Schema<IUser, UserModel, IUserMethods>(
	{
		tag: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },

		avatar: { type: String, default: null },
		banner: { type: String, default: null },
		bio: { type: String, default: '' },

		sessions: [{ type: Types.ObjectId, ref: 'Session' }],
		group: { type: Number, default: 0 },
	},
	{
		statics: {
			getUser: function (tag: string) {
				return this.findOne({ tag });
			},

			register: function (tag: string, username: string, password: string) {
				const saltRounds = parseInt(process.env.SALT_ROUNDS || '') || 10;
				const hash = hashSync(password, saltRounds);

				return this.create({
					tag,
					username,
					password: hash,
				});
			},

			authorize: async function (tag: string, password: string) {
				const usr = await this.findOne({ tag }).exec();
				if (!usr) return null;

				const saltRounds = parseInt(process.env.SALT_ROUNDS || '') || 10;
				const hash = hashSync(password, saltRounds);

				if (compareSync(password, hash)) return usr;
				else return null;
			},

			authenticate: async function (token: string) {
				return await Session.getSession(token);
			},
		},
	}
);

userSchema.methods.authorize = async function (ip?: string) {
	const session = await Session.createSession(this._id, ip);
	this.sessions.push(session._id);
	await this.save();
	return session;
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
