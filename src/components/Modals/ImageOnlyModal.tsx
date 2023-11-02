import { XMarkIcon } from "@heroicons/react/24/solid";

import { useModal } from "~/components/Handlers/ModalHandler";

export default function ImageOnlyModal({ src }: { src: string }) {
    const { closeModal } = useModal();

    return (
        <div className="flex w-full h-full justify-end">
            <div className="grow relative flex flex-col justify-end items-center">
                <div
                    className={
                        "absolute w-8 h-8 rounded-full bg-gray-700/20 backdrop-blur-sm p-1" +
                        " top-2 left-2 flex items-center justify-center cursor-pointer z-10"
                    }
                    onClick={() => {
                        closeModal();
                    }}
                >
                    <XMarkIcon className="text-black dark:text-white" />
                </div>
                <div className="grow h-full w-full relative">
                    <div
                        className="absolute left-0 right-0 top-0 bottom-0 m-auto flex justify-center"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="h-full object-contain"
                            src={src}
                            alt={"Post Image"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
