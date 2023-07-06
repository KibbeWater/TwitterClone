import mongoose, { Schema, Document, Types, Model, model } from 'mongoose';
import { DeviceTypeEnum } from '../types/INotificationEndpoints';

export interface IPushNotificationDevice {
	_id: Types.ObjectId;
	user?: Types.ObjectId;
	deviceType: DeviceTypeEnum;
	device: string;
}

interface PushNotificationDeviceModel extends Model<IPushNotificationDevice> {
	createDevice: (user: Types.ObjectId, deviceType: DeviceTypeEnum, device: string) => Promise<IPushNotificationDevice | null>;
}

const notificationDeviceSchema = new Schema<IPushNotificationDevice, PushNotificationDeviceModel>(
	{
		user: { type: Types.ObjectId, ref: 'User' },
		deviceType: { type: Number, required: true },
		device: { type: String, required: true },
	},
	{
		statics: {
			createDevice: function (user: Types.ObjectId, deviceType: DeviceTypeEnum, device: string) {
				return new Promise<IPushNotificationDevice | null>(async (resolve, reject) => {
					try {
						const deviceExists = await this.findOne({ user, deviceType, device });
						if (deviceExists) return resolve(deviceExists);

						const newDevice = await this.create({ user, deviceType, device });
						return resolve(newDevice);
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
