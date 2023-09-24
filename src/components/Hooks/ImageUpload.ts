import { useCallback } from "react";
import { api } from "~/utils/api";

export type UploadRules = {
    sizes: {
        banner: number;
        image: number;
        avatar: number;
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
    },
    types: ["image/jpeg", "image/png", "image/webp"],
};

export function useImageUploader() {
    const { data: ruleData } = api.s3.getUploadRules.useQuery();
    const { mutate: _uploadImage } = api.s3.startUploadImage.useMutation();

    const rules = ruleData ?? defaultRules;

    const uploadImage = useCallback<
        (file: File, type: "image" | "banner" | "avatar") => Promise<string>
    >(
        (file, type) => {
            return new Promise((resolve, reject) => {
                const filename = `${generateRandomName(32)}.${file.name
                    .split(".")
                    .pop()}`;
                const filetype = file.type;

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

    return { rules, uploadImage };
}
