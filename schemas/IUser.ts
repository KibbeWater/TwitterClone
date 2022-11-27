import mongoose, { Model, model, Schema, Types } from 'mongoose';
import { compareSync, hashSync } from 'bcryptjs';
import Session, { ISession } from './ISession';
import Post, { IPost } from './IPost';

export interface IUser {
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
	post: (content: string, quote?: Types.ObjectId) => Promise<IPost | null>;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
	getUser: (tag: string) => Promise<IUser | null>;
	register: (tag: string, username: string, password: string) => Promise<IUser | null>;
	authorize: (tag: string, password: string, ip?: string) => Promise<{ user: IUser; token: string } | null>;
	authenticate: (token: string) => Promise<ISession | null>;
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

			authorize: async function (tag: string, password: string, ip?: string) {
				const usr = await this.findOne({ tag }).exec();
				if (!usr) return null;

				const saltRounds = parseInt(process.env.SALT_ROUNDS || '') || 10;
				const hash = hashSync(password, saltRounds);

				if (!compareSync(password, hash)) return null;

				const session = await Session.createSession(usr._id, ip);
				usr.sessions.push(session._id);
				await usr.save();

				return { user: usr, token: session.token };
			},

			authenticate: async function (token: string) {
				const session = await Session.getSession(token);
				if (!session) return null;

				// Get the owner of the session
				const usr = await this.findOne({ _id: session.owner }).exec();
				if (!usr) return null;

				return usr;
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

userSchema.methods.post = async function (content: string, quote?: Types.ObjectId) {
	return Post.post(this._id, content, quote);
};

// Fix recompilation error
const User = (mongoose.models.User as UserModel) || model<IUser, UserModel>('User', userSchema);

export default User;
