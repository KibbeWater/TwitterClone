import { useState, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import LabelledInput from "../LabelledInput";
import { useModal } from "../Handlers/ModalHandler";
import { useDropzone } from "react-dropzone";
import { CameraIcon } from "@heroicons/react/24/outline";

export default function ProfileEditor({
    name: defName,
    bio: defBio,
}: {
    name: string;
    bio: string;
}) {
    const [name, setName] = useState(defName);
    const [bio, setBio] = useState(defBio);

    const { setModal } = useModal();
    const { getRootProps: avatarRProps, isDragActive: isAvatarActive } =
        useDropzone({});
    const { getRootProps: bannerRProps, isDragActive: isBannerActive } =
        useDropzone({});

    const handleNameUpdate = useCallback<(t: string) => void>(
        (t) => setName(t),
        [setName],
    );

    const handleBioUpdate = useCallback<(t: string) => void>(
        (t) => setBio(t),
        [setBio],
    );

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
                    <button className="dark:bg-white bg-black dark:hover:bg-gray-200 hover:bg-gray-700 transition-colors duration-300 dark:text-black text-white px-4 py-1 font-semibold rounded-full">
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
                    <div
                        className={
                            "absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 bg-gray-500"
                        }
                    />
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
                            <div
                                className={`object-cover w-full h-full rounded-full bg-gray-500${
                                    isAvatarActive
                                        ? " outline-dashed outline-accent-primary-500 outline-[2px]"
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
