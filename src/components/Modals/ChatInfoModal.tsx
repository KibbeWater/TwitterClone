import { XMarkIcon, CameraIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useModal } from "~/components/Handlers/ModalHandler";
import { useImageUploader } from "~/components/Hooks/ImageUpload";
import LabelledInput from "../LabelledInput";
import { api } from "~/utils/api";

export default function ChatInfoModal({
    id: chatId,
    image: defImage,
    name: defName,
    mutate,
}: {
    id: string;
    image: string;
    name: string;
    mutate?: () => void;
}) {
    const [name, setName] = useState<string>(defName);
    const [image, setImage] = useState<string>(defImage);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);

    const { uploadImage, rules } = useImageUploader();
    const { sizes: maxSizes } = rules;

    const { closeModal } = useModal();

    const { mutate: _updateChat } = api.chat.updateChat.useMutation();

    const { getRootProps: imageRProps, isDragActive: isImageActive } =
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
                    setImage(`data:image/png;base64,${buf.toString("base64")}`);
                    setImageFile(file as File);
                };
                reader.readAsArrayBuffer(file!);
            },
        });

    const handleSave = useCallback(async () => {
        const newURLs: { image?: string } = {};
        if (imageFile)
            newURLs.image = await uploadImage(imageFile, "chat-image");
        _updateChat(
            { chatId, ...newURLs, name },
            {
                onSuccess: () => {
                    closeModal();
                    mutate?.();
                },
                onError: (e) => {
                    console.error(e);
                    alert(e.message);
                },
            },
        );
    }, [imageFile, uploadImage, _updateChat, name, chatId, closeModal, mutate]);

    return (
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-black min-h-[200px] max-w-[500px] max-h-[90vh] w-full pb-3">
            <div className="w-full grid grid-cols-2 h-12 items-center border-b-[2px] border-highlight-light dark:border-highlight-dark">
                <div className="flex items-center gap-8 mx-4">
                    <XMarkIcon
                        className="dark:text-white w-6 h-6 cursor-pointer"
                        onClick={() => closeModal()}
                    />
                    <h2 className="dark:text-white text-xl font-bold">Edit</h2>
                </div>
                <div className="flex justify-self-end mx-4">
                    <button
                        onClick={() => {
                            handleSave().catch(console.error);
                        }}
                        className="dark:bg-white bg-black dark:hover:bg-gray-200 hover:bg-gray-700 transition-colors duration-300 dark:text-black text-white px-4 py-1 font-semibold rounded-full"
                    >
                        Save
                    </button>
                </div>
            </div>
            <div className="w-full flex justify-center items-center pt-4 pb-8">
                <div
                    {...imageRProps()}
                    className={[
                        "rounded-full relative",
                        isImageActive
                            ? "outline-dashed outline-accent-primary-500 outline-[2px]"
                            : undefined,
                    ].join(" ")}
                >
                    <Image
                        src={image}
                        alt="Group image"
                        width={80}
                        height={80}
                        className="rounded-full h-20 object-cover"
                    />
                    <div className="absolute w-full h-full flex justify-center items-center z-10 top-0 left-0">
                        <button className="p-2 w-8 h-8 bg-black/30 rounded-full overflow-hidden">
                            <CameraIcon className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-3">
                <LabelledInput
                    value={name}
                    onChange={(e) => setName(e)}
                    label="Group name"
                />
            </div>
        </div>
    );
}
