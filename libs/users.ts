import { Schema, model } from 'mongoose';

interface IUser {
	tag: string;
	username: string;
	password: string;
	avatar?: string;
	banner?: string;
	bio: string;
	group: number;
}

const userSchema = new Schema<IUser>({
	tag: { type: String, required: true, unique: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	avatar: String,
	banner: String,
	bio: { type: String, required: true },
	group: { type: Number, required: true },
});

const User = model<IUser>('User', userSchema);

export function CreateUser(user: IUser) {
	return new User(user).save();
}

export function GetUserByTag(tag: string) {
	return User.findOne({
		tag: tag,
	});
}

export default User;
