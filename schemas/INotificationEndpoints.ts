import mongoose, { Schema, Document } from 'mongoose';
import { DeviceTypeEnum } from '../types/INotificationEndpoints';

interface IPushNotificationDevice extends Document {
	id: string;
	user: mongoose.Types.ObjectId;
	deviceType: DeviceTypeEnum;
	device: string;
}

const pushNotificationDeviceSchema: Schema = new Schema({
	id: { type: String, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	deviceType: { type: Number, required: true },
	device: { type: String, required: true },
});

pushNotificationDeviceSchema.statics.createDevice = async function (device: IPushNotificationDevice): Promise<IPushNotificationDevice> {
	const newDevice = new this(device);
	return newDevice.save();
};

const PushNotificationDevice = mongoose.model<IPushNotificationDevice>('PushNotificationDevice', pushNotificationDeviceSchema);

export { PushNotificationDevice };
