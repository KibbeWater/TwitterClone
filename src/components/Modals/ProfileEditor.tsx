import { useState, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import SingleLabelledInput from "../SingleLabelledInput";
import { useModal } from "../Handlers/ModalHandler";

export default function ProfileEditor({ name: defName }: { name: string }) {
    const [name, setName] = useState(defName);

    const { setModal } = useModal();

    const handleNameUpdate = useCallback<(t: string) => void>(
        (t) => setName(t),
        [setName],
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
                    <button className="bg-white hover:bg-gray-200 transition-colors duration-500 text-black px-4 py-1 font-semibold rounded-full">
                        Save
                    </button>
                </div>
            </div>
            <div>
                <div className="w-full pb-[33.3%] bg-neutral-700 relative flex justify-center">
                    <div
                        className={
                            "absolute h-full w-full p-[auto] top-0 bottom-0 right-0 left-0 bg-gray-500"
                        }
                    />
                </div>
                <div className="w-full flex justify-between relative">
                    <div className="relative h-16 mb-3">
                        <div className="w-32 h-32 absolute left-5 -top-16">
                            <div>
                                <div className="object-cover w-32 h-32 rounded-full border-[4px] border-white dark:border-black bg-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 mx-4">
                    <SingleLabelledInput
                        onChange={handleNameUpdate}
                        value={name}
                        maxLength={40}
                        label="Name"
                    />
                </div>
            </div>
        </div>
    );
}
