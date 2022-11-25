import { model, Schema } from 'mongoose';

interface IUser {
	tag: string;
	username: string;
	password: string;

	avatar?: string;
	banner?: string;
	bio: string;

	group: number;
}

const userSchema = new Schema<IUser>(
	{
		tag: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },

		avatar: { type: String, default: null },
		banner: { type: String, default: null },
		bio: { type: String, default: '' },

		group: { type: Number, default: 0 },
	},
	{
		methods: {},
		statics: {},
	}
);

const UserModel = model<IUser>('User', userSchema);

export default UserModel;
