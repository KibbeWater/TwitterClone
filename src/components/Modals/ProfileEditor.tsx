import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { CameraIcon } from "@heroicons/react/24/outline";

import { api } from "~/utils/api";
import { usernameRegex } from "~/utils/regexStandards";
import { useModal } from "../Handlers/ModalHandler";
import { useImageUploader } from "../Hooks/ImageUpload";
import LabelledInput from "../LabelledInput";

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
    const [tag, setTag] = useState<string | undefined>(undefined);
    const [bio, setBio] = useState(defBio);
    const [avatar, setAvatar] = useState<string>(defAvatar);
    const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
    const [banner, setBanner] = useState<string | undefined | null>(defBanner);
    const [bannerFile, setBannerFile] = useState<File | undefined>(undefined);

    const { data: session, update: _updateSession } = useSession();
    const router = useRouter();

    const { mutate: _updateProfile } = api.user.updateProfile.useMutation();

    const { uploadImage, rules } = useImageUploader();
    const { sizes: maxSizes } = rules;

    const { closeModal } = useModal();
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
                    setAvatarFile(file as File);
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
                    setBannerFile(file as File);
                };
                reader.readAsArrayBuffer(file!);
            },
        });

    const bannerRef = useRef<HTMLImageElement>(null);

    const handleNameUpdate = useCallback<(t: string) => void>(
        (t) => setName(t),
        [setName],
    );

    const handleTagUpdate = useCallback<(t: string) => void>(
        (t) => setTag(t.toLowerCase()),
        [setTag],
    );

    const handleBioUpdate = useCallback<(t: string) => void>(
        (t) => setBio(t),
        [setBio],
    );

    useEffect(() => {
        setTag((p) => {
            if (!p) return session?.user?.tag;
            return p;
        });
    }, [session?.user]);

    const handleSave = useCallback(async () => {
        const newURLs: { avatar?: string; banner?: string } = {};
        if (bannerFile)
            newURLs.banner = await uploadImage(bannerFile, "banner");
        if (avatarFile)
            newURLs.avatar = await uploadImage(avatarFile, "avatar");
        _updateProfile(
            {
                name: defName === name ? undefined : name,
                bio: defBio === bio ? undefined : bio,
                image: newURLs.avatar,
                banner: newURLs.banner,
                tag: tag === session?.user?.tag ? undefined : tag,
            },
            {
                onSuccess: () => {
                    if (tag !== session?.user?.tag)
                        router
                            .push("/")
                            .then(() => _updateSession())
                            .catch(console.error);
                    closeModal();
                },
                onError: (e) => {
                    console.error(e);
                    alert(e.message);
                },
            },
        );
    }, [
        defBio,
        bio,
        defName,
        name,
        tag,
        session?.user?.tag,
        _updateProfile,
        bannerFile,
        avatarFile,
        uploadImage,
        closeModal,
        router,
        _updateSession,
    ]);

    useEffect(() => {
        if (!bannerRef.current) return;
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

    const tagRegex = useMemo(() => /^[a-zA-Z0-9_-]{0,16}$/, []);
    const softTagRegex = useMemo(() => usernameRegex, []);

    const tagResetDate = new Date(
        new Date(session?.user.lastTagReset ?? 0).getTime() +
            30 * 24 * 60 * 60 * 1000,
    );

    const isTagResetPast = tagResetDate.getTime() < Date.now();

    return (
        <div
            className="overflow-hidden rounded-2xl bg-white dark:bg-black min-h-[400px] max-w-[600px] max-h-[90vh] w-full h-[650px]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full grid grid-cols-2 h-12 items-center">
                <div className="flex items-center gap-8 mx-4">
                    <XMarkIcon
                        className="dark:text-white w-6 h-6 cursor-pointer"
                        onClick={() => closeModal()}
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
                            ? " mx-[2px] outline-dashed outline-[2px] outline-accent-primary-500"
                            : ""
                    }`}
                    style={{
                        width: isBannerActive
                            ? "calc(100% - 4px)!important"
                            : undefined,
                    }}
                >
                    {banner && (
                        <Image
                            src={banner}
                            alt="Your banner"
                            sizes="100vw"
                            fill={true}
                            ref={bannerRef}
                            className={
                                "absolute h-full w-full top-0 bottom-0 right-0 left-0 object-cover"
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
                    <div className="relative">
                        {!isTagResetPast && (
                            <p className="absolute -top-[calc(1em+0.25rem)] text-xs text-gray-500 ml-2">
                                Next tag change on{" "}
                                {tagResetDate.toLocaleString()}
                            </p>
                        )}
                        <LabelledInput
                            onChange={handleTagUpdate}
                            value={tag}
                            maxLength={16}
                            label="Tag"
                            disabled={!session?.user || !isTagResetPast}
                            validator={(t) => tagRegex.test(t)}
                            softValidator={(t) => softTagRegex.test(t)}
                            placeholder={session?.user ? undefined : "..."}
                        />
                    </div>
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
