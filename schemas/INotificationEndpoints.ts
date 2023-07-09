import mongoose, { Schema, Document, Types, Model, model } from 'mongoose';
import { DeviceTypeEnum } from '../types/INotificationEndpoints';
import User from './IUser';

export interface IPushNotificationDevice {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	deviceType: DeviceTypeEnum;
	device: string;
	deviceArn: string;
}

interface PushNotificationDeviceModel extends Model<IPushNotificationDevice> {
	createDevice: (
		user: Types.ObjectId,
		deviceType: DeviceTypeEnum,
		device: string,
		deviceArn: string
	) => Promise<IPushNotificationDevice | null>;
}

const notificationDeviceSchema = new Schema<IPushNotificationDevice, PushNotificationDeviceModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		deviceType: { type: Number, required: true },
		device: { type: String, required: true },
		deviceArn: { type: String, required: true },
	},
	{
		statics: {
			createDevice: function (user: Types.ObjectId, deviceType: DeviceTypeEnum, device: string, deviceArn: string) {
				return new Promise<IPushNotificationDevice | null>(async (resolve, reject) => {
					try {
						const deviceExists = await this.findOne({ user, deviceType, device });
						if (deviceExists) return resolve(deviceExists);

						this.create({ user, deviceType, device, deviceArn })
							.then((newDevice) =>
								User.findByIdAndUpdate(user._id, { $push: { notificationDevices: newDevice } }, { new: true })
									.then(() => resolve(newDevice))
									.catch((err) => {
										console.error(err);
										return resolve(null);
									})
							)
							.catch((err) => {
								console.error(err);
								return resolve(null);
							});
					} catch (err) {
						console.error(err);
						return resolve(null);
					}
				});
			},
		},
	}
);

const PushNotificationDevice =
	(mongoose.models.PushNotificationDevice as PushNotificationDeviceModel) ||
	model<IPushNotificationDevice, PushNotificationDeviceModel>('PushNotificationDevice', notificationDeviceSchema);

export default PushNotificationDevice;
