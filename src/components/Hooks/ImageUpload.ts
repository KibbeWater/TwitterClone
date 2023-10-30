import { useCallback, useState } from "react";

import { api } from "~/utils/api";

export type UploadRules = {
    sizes: {
        banner: number;
        image: number;
        avatar: number;
        "chat-image": number;
        chat: number;
    };
    types: string[];
};

function generateRandomName(charCount: number) {
    const randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < charCount; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length),
        );
    }
    return result;
}

const defaultRules: UploadRules = {
    sizes: {
        image: 20 * 1024 * 1024, // 20 MB
        banner: 10 * 1024 * 1024, // 10 MB
        avatar: 6 * 1024 * 1024, // 6 MB
        "chat-image": 6 * 1024 * 1024, // 6 MB
        chat: 20 * 1024 * 1024, // 20 MB
    },
    types: ["image/jpeg", "image/png", "image/webp"],
};

export function useImageUploader() {
    const [isUploading, setUploading] = useState(false);

    const { data: ruleData } = api.s3.getUploadRules.useQuery();
    const { mutate: _uploadImage } = api.s3.startUploadImage.useMutation();

    const rules = ruleData ?? defaultRules;

    const uploadImage = useCallback<
        (
            file: File,
            type: "image" | "banner" | "avatar" | "chat-image" | "chat",
        ) => Promise<string>
    >(
        (file, type) => {
            return new Promise((resolve, reject) => {
                const filename = `${generateRandomName(32)}.${file.name
                    .split(".")
                    .pop()}`;
                const filetype = file.type;

                setUploading(true);
                _uploadImage(
                    {
                        type,
                        filename,
                        filetype,
                        filesize: file.size,
                    },
                    {
                        onSuccess: (uploadInfo) => {
                            fetch(uploadInfo.url, {
                                method: "PUT",
                                body: file.slice(),
                                headers: {
                                    "Content-Type": filetype,
                                },
                            })
                                .then((res) => {
                                    setUploading(false);
                                    res.ok
                                        ? resolve(uploadInfo.cdnURL)
                                        : reject();
                                })
                                .catch((err) => {
                                    setUploading(false);
                                    reject(err);
                                });
                        },
                        onError: (e) => {
                            setUploading(false);
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

    return { rules, uploadImage, isUploading };
}
