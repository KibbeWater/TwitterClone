export enum DeviceTypeEnum {
	IOS = 0,
	ANDROID = 1,
	WEB = 2,
}

export type INotification = {
	_id: string;
	user?: IUser;
	deviceType: DeviceTypeEnum;
	device: string;
};
