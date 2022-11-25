import { model, Schema, Types } from 'mongoose';

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

export const userSchema = new Schema<IUser>(
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
		methods: {
			getSessions: function () {
				return this.sessions;
			},
			setUsername: function (username: string) {
				this.username = username;
			},
			setPassword: function (password: string) {
				this.password = password;
			},
			setAvatar: function (avatar: string) {
				this.avatar = avatar;
			},
			setBanner: function (banner: string) {
				this.banner = banner;
			},
		},
		statics: {
			getUser: function (tag: string) {
				return this.findOne({ tag });
			},

			authorize: function (tag: string, password: string) {
				return this.findOne({ tag, password });
			},
			authenticate: function (token: string) {
				return this.findOne({ 'sessions.token': token });
			},
		},
	}
);

const UserModel = model<IUser>('User', userSchema);

export default UserModel;
