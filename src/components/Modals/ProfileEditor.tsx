import { XMarkIcon } from "@heroicons/react/20/solid";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useCallback, useState, useRef, useEffect } from "react";

import { useDropzone } from "react-dropzone";
import { api } from "~/utils/api";
import { useModal } from "../Handlers/ModalHandler";
import LabelledInput from "../LabelledInput";
import Image from "next/image";

// Function to generate 32 character random string
function generateRandomString() {
    const randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length),
        );
    }
    return result;
}

type FileInfo = { file: Buffer; fileData: File };

export default function ProfileEditor({
    name: defName,
    bio: defBio,
    avatar: defAvatar,
    banner: defBanner,
}: {
    name: string;
    bio: string;
    avatar: string;
    banner: string | undefined | null;
}) {
    const [name, setName] = useState(defName);
    const [bio, setBio] = useState(defBio);
    const [avatar, setAvatar] = useState<string>(defAvatar);
    const [avatarFile, setAvatarFile] = useState<FileInfo | undefined>(
        undefined,
    );
    const [banner, setBanner] = useState<string | undefined | null>(defBanner);
    const [bannerFile, setBannerFile] = useState<FileInfo | undefined>(
        undefined,
    );

    const { data: ruleData } = api.s3.getUploadRules.useQuery();
    const { mutate: _updateProfile } = api.user.updateProfile.useMutation();
    const { mutate: _uploadImage } = api.s3.startUploadImage.useMutation();

    const { sizes: maxSizes } = ruleData ?? {};

    const { setModal } = useModal();
    const { getRootProps: avatarRProps, isDragActive: isAvatarActive } =
        useDropzone({
            multiple: false,
            maxSize: maxSizes?.avatar ?? 6 * 1024 * 1024,
            accept: {
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/webp": [".webp"],
            },
            onDropAccepted: (files) => {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const buf = Buffer.from(reader.result as ArrayBuffer);
                    setAvatar(
                        `data:image/png;base64,${buf.toString("base64")}`,
                    );
                    setAvatarFile({ file: buf, fileData: file as File });
                };
                reader.readAsArrayBuffer(file!);
            },
        });
    const { getRootProps: bannerRProps, isDragActive: isBannerActive } =
        useDropzone({
            multiple: false,
            maxSize: maxSizes?.banner ?? 6 * 1024 * 1024,
            accept: {
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/webp": [".webp"],
            },
            onDropAccepted: (files) => {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const buf = Buffer.from(reader.result as ArrayBuffer);
                    setBanner(
                        `data:image/png;base64,${buf.toString("base64")}`,
                    );
                    setBannerFile({ file: buf, fileData: file as File });
                };
                reader.readAsArrayBuffer(file!);
            },
        });

    const bannerRef = useRef<HTMLImageElement>(null);

    const handleImageUpload = useCallback<
        (file: FileInfo, type: "image" | "banner" | "avatar") => Promise<string>
    >(
        (file, type) => {
            return new Promise((resolve, reject) => {
                const filename = `${generateRandomString()}.${file.fileData.name
                    .split(".")
                    .pop()}`;
                const filetype = file.fileData.type;

                _uploadImage(
                    {
                        type,
                        filename,
                        filetype,
                        filesize: file.fileData.size,
                    },
                    {
                        onSuccess: (uploadInfo) => {
                            fetch(uploadInfo.url, {
                                method: "PUT",
                                body: file.fileData.slice(),
                                headers: {
                                    "Content-Type": filetype,
                                },
                            })
                                .then((res) => {
                                    res.ok
                                        ? resolve(uploadInfo.cdnURL)
                                        : reject();
                                })
                                .catch(reject);
                        },
                        onError: (e) => {
                            console.error(e);
                            alert(
                                "Failed to upload image, check console for more info.",
                            );
                            reject(e);
                        },
                    },
                );
            });
        },
        [_uploadImage],
    );

    const handleNameUpdate = useCallback<(t: string) => void>(
        (t) => setName(t),
        [setName],
    );

    const handleBioUpdate = useCallback<(t: string) => void>(
        (t) => setBio(t),
        [setBio],
    );

    const handleSave = useCallback(async () => {
        const newURLs: { avatar?: string; banner?: string } = {};
        if (bannerFile)
            newURLs.banner = await handleImageUpload(bannerFile, "banner");
        if (avatarFile)
            newURLs.avatar = await handleImageUpload(avatarFile, "avatar");
        _updateProfile(
            {
                name: defName === name ? undefined : name,
                bio: defBio === bio ? undefined : bio,
                image: newURLs.avatar,
                banner: newURLs.banner,
            },
            {
                onSuccess: () => setModal(null),
                onError: (e) => {
                    console.error(e);
                    alert(
                        "Failed to update profile, check console for more info.",
                    );
                },
            },
        );
    }, [
        setModal,
        defBio,
        bio,
        defName,
        name,
        _updateProfile,
        bannerFile,
        avatarFile,
        handleImageUpload,
    ]);

    useEffect(() => {
        if (!bannerRef.current) return;
        // Attach an onError handler to the image, so that if it fails to load we can hide it
        const banner = bannerRef.current;

        bannerRef.current.onerror = () =>
            bannerRef.current?.style.setProperty("display", "none!important");

        return () => {
            banner.onerror = null;
        };
    }, [bannerRef]);

    useEffect(() => {
        if (!bannerRef.current) return;
        const banner = bannerRef.current;

        banner.style.removeProperty("display");
    }, [banner]);

    return (
        <div
            className="overflow-hidden rounded-2xl bg-white dark:bg-black min-h-[400px] max-w-[600px] max-h-[90vh] w-full h-[650px]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full grid grid-cols-2 h-12 items-center">
                <div className="flex items-center gap-8 mx-4">
                    <XMarkIcon
                        className="dark:text-white w-6 h-6 cursor-pointer"
                        onClick={() => setModal(null)}
                    />
                    <h2 className="dark:text-white text-xl font-bold">
                        Edit profile
                    </h2>
                </div>
                <div className="flex justify-self-end mx-4">
                    <button
                        onClick={() => {
                            handleSave().catch(() =>
                                console.error("Failed to save"),
                            );
                        }}
                        className="dark:bg-white bg-black dark:hover:bg-gray-200 hover:bg-gray-700 transition-colors duration-300 dark:text-black text-white px-4 py-1 font-semibold rounded-full"
                    >
                        Save
                    </button>
                </div>
            </div>
            <div>
                <div
                    {...bannerRProps()}
                    className={`w-full pb-[33.3%] bg-neutral-700 relative flex justify-center${
                        isBannerActive
                            ? " mx-[2px] !w-[calc(100% - 4px)] outline-dashed outline-[2px] outline-accent-primary-500"
                            : ""
                    }`}
                >
                    {banner && (
                        <Image
                            src={banner}
                            alt="Your banner"
                            sizes="100vw"
                            fill={true}
                            ref={bannerRef}
                            className={
                                "absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 object-cover"
                            }
                        />
                    )}
                    <div className="absolute w-full h-full flex justify-center items-center z-10 top-0 left-0">
                        <button className="p-2 w-10 h-10 bg-black/30 rounded-full">
                            <CameraIcon className="text-white" />
                        </button>
                    </div>
                </div>
                <div className="w-full flex justify-between relative">
                    <div className="relative h-16 mb-3">
                        <div
                            {...avatarRProps()}
                            className="w-32 h-32 absolute left-5 -top-16 p-2 bg-white dark:bg-black rounded-full overflow-hidden"
                        >
                            <Image
                                src={avatar}
                                alt="Your profile picture"
                                width={128}
                                height={128}
                                className={`object-cover w-full h-full rounded-full ${
                                    isAvatarActive
                                        ? "outline-dashed outline-accent-primary-500 outline-[2px]"
                                        : ""
                                }`}
                            />
                            <div className="absolute w-full h-full flex justify-center items-center z-10 top-0 left-0">
                                <button className="p-2 w-10 h-10 bg-black/30 rounded-full">
                                    <CameraIcon className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-8 px-4">
                    <LabelledInput
                        onChange={handleNameUpdate}
                        value={name}
                        maxLength={50}
                        label="Name"
                    />
                    <LabelledInput
                        onChange={handleBioUpdate}
                        value={bio}
                        maxLength={160}
                        maxRows={3}
                        minRows={3}
                        label="Bio"
                    />
                </div>
            </div>
        </div>
    );
}
