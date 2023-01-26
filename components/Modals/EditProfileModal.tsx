import { faImage, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import axios from 'redaxios';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import { KeyedMutator } from 'swr';
import { SafeUser } from '../../libs/user';
import { ModalContext } from '../Handlers/ModalHandler';
import TextareaAutosize from '../TextAutosize';
import { UserContext } from '../Handlers/UserHandler';

function readFile(): Promise<string | null> {
	return new Promise((resolve) => {
		let fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.onchange = (e) => {
			if (!fileInput.files) return resolve(null);

			let file = fileInput.files[0];
			let reader = new FileReader();

			reader.onload = () => {
				const res = reader.result as string;

				if (res.length > 4 * 1024 * 1024) {
					alert('Uploads cannot exceed 4mb!!');
					return resolve(null);
				}

				resolve(res);
			};
			reader.readAsDataURL(file);
		};
		fileInput.click();
	});
}

function uploadImages({ banner, avatar }: { banner?: string; avatar?: string }): Promise<{ banner?: string; avatar?: string }> {
	return new Promise((resolve) => {
		if (!banner && !avatar) return resolve({});

		axios.post<{ success: boolean; banner?: string; avatar?: string }>('/api/user/upload', { banner, avatar }).then((res) => {
			let result: { banner?: string; avatar?: string } = {};
			if (res.data.avatar) result.avatar = res.data.avatar;
			if (res.data.banner) result.banner = res.data.banner;
			resolve(result);
		});
	});
}

export default function EditProfileModal({
	mutate,
}: {
	mutate?: KeyedMutator<{
		success: boolean;
		user: SafeUser;
	}>;
}) {
	const { user, mutate: mutateUser } = useContext(UserContext);
	const { setModal } = useContext(ModalContext);

	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');

	const [avatar, setAvatar] = useState('');
	const [banner, setBanner] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const uploadAvatar = async () => {
		let image = await readFile();
		if (image) setAvatar(image);
	};

	const uploadBanner = async () => {
		let image = await readFile();
		if (image) setBanner(image);
	};

	const saveAndClose = async () => {
		setLoading(true);

		let curBanner = banner;
		let curAvatar = avatar;

		const uploadBanner = !banner.startsWith('http') && banner ? await uploadImages({ banner: curBanner }) : {};
		const uploadAvatar = !avatar.startsWith('http') && avatar ? await uploadImages({ avatar: curAvatar }) : {};

		if (uploadBanner.banner) curBanner = uploadBanner.banner;
		if (uploadAvatar.avatar) curAvatar = uploadAvatar.avatar;

		let editInfo: any = {};
		if (!curBanner) editInfo.banner = '';
		if (!curAvatar) editInfo.avatar = '';

		axios
			.post<{ success: boolean; error?: string }>('/api/user/edit', {
				username,
				bio,
				...editInfo,
			})
			.then((res) => {
				if (res.data.success) {
					setLoading(false);

					setAvatar(curAvatar);
					setBanner(curBanner);

					if (mutate) mutate();
					if (mutateUser) mutateUser();
					if (setModal) setModal(null);
				} else {
					setError(res.data.error || 'An error occured');
					setLoading(false);
				}
			});
	};

	const closeModal = () => {
		if (setModal) setModal(null);
	};

	useEffect(() => {
		if (user) {
			if (!username) setUsername(user.username);
			if (!bio) setBio(user.bio);
			if (!avatar) setAvatar(user.avatar || '');
			if (!banner) setBanner(user.banner || '');
		}
	}, [user]);

	if (!user) return null;

	return (
		<div
			className={
				'bg-black rounded-2xl min-h-[400px] max-w-[600px] max-h-[90vh] w-full h-[650px] flex flex-col relative overflow-hidden overflow-y-auto'
			}
		>
			<div className={'w-full h-12 flex justify-between sticky top-0 left-0 right-0 items-center bg-black/60 backdrop-blur-sm'}>
				<div className={'flex items-center'}>
					<FontAwesomeSvgIcon
						icon={faXmark}
						size={'xl'}
						className={'text-white ml-4 m-6 cursor-pointer'}
						onClick={() => closeModal()}
					/>
					<h3 className={'text-white justify-self-left ml-3 font-bold'}>Edit Profile</h3>
				</div>
				<div>
					<button
						className={'bg-white text-black border-0 font-semibold mr-2 py-1 px-4 cursor-pointer rounded-full'}
						onClick={() => saveAndClose()}
					>
						Save
					</button>
				</div>
			</div>
			<div className={'m-[2px]'}>
				<div className={'w-full pb-[33.3%] relative flex justify-center items-center bg-gray-500'}>
					<Image
						src={banner || '/error.png'}
						alt={user.username + "'s Banner"}
						sizes={'100vw'}
						fill
						className={'absolute object-cover top-0 right-0 left-0 bottom-0 h-full w-full m-auto' + (banner ? '' : ' hidden')}
					/>
					<div className={'absolute top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center'}>
						<button
							className={
								'w-9 h-9 flex justify-center items-center rounded-full m-[5px] cursor-pointer backdrop-blur-sm bg-gray-800/75'
							}
							onClick={() => uploadBanner()}
						>
							<FontAwesomeSvgIcon icon={faImage} className={'text-white'} />
						</button>
						{banner ? (
							<button
								className={
									'w-9 h-9 flex justify-center items-center rounded-full m-[5px] cursor-pointer backdrop-blur-sm bg-gray-800/75'
								}
								onClick={() => setBanner('')}
							>
								<FontAwesomeSvgIcon icon={faXmark} size={'lg'} className={'text-white'} />
							</button>
						) : null}
					</div>
				</div>
				<div className={'relative h-[50px] w-[100px] ml-5 mb-5'}>
					<div className={'absolute top-[-50px] left-0 right-0 w-[100px] h-[100px] flex justify-center items-center'}>
						<div
							className={
								'absolute w-[35px] h-[35px] flex justify-center items-center rounded-full m-[5px] cursor-pointer backdrop-blur-sm bg-gray-800/75'
							}
							onClick={() => uploadAvatar()}
						>
							<FontAwesomeSvgIcon icon={faImage} color={'white'} />
						</div>
						<Image
							src={avatar || '/default_avatar.png'}
							alt={`${user.username}'s Avatar`}
							width={100}
							height={100}
							className={'object-cover w-[100px] h-[100px] rounded-full border-[4px] box-border border-black'}
						/>
					</div>
				</div>
				<div className={'border-gray-500 border-[1px] rounded-md p-2 pt-0 m-5'}>
					<p className={'text-gray-400 text-sm m-0 mt-1 mb-px'}>Name</p>
					<input
						className={'text-white bg-black/0 border-0 p-0 m-0 outline-none w-full'}
						value={username}
						onChange={(e) =>
							setUsername((prev) => {
								let newUsername = e.target.value;
								if (prev.length >= 32 && e.target.value.length > prev.length) return prev;
								return newUsername;
							})
						}
					/>
				</div>
				<div className={'border-gray-500 border-[1px] rounded-md p-2 pt-0 m-5'}>
					<p className={'text-gray-400 text-sm m-0 mt-1 mb-px'}>Bio</p>
					<TextareaAutosize
						className={'text-white bg-black/0 border-0 text-lg leading-6 columns-4 resize-none w-full p-0 m-0 outline-none'}
						value={bio}
						onChange={(e) => setBio(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
}
