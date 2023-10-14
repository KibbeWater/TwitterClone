import { XMarkIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useModal } from "../Handlers/ModalHandler";

export default function PremiumModal() {
    const { closeModal } = useModal();

    const isPremium = true;

    return (
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-lg flex relative overflow-hidden">
            <div
                className={
                    "w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/10 absolute top-2 right-2"
                }
                onClick={() => closeModal()}
            >
                <XMarkIcon className={"text-black dark:text-white"} />
            </div>
            {isPremium ? (
                <div className="py-12 px-24 flex items-center">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                    <p>Hey! You are already a Twatter RED subscriber.</p>
                </div>
            ) : (
                <div>
                    
                </div>
            )}
        </div>
    );
}
