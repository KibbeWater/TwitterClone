import { signIn } from "next-auth/react";

export default function LoginBanner() {
    return (
        <div className="w-full h-14 md:h-20 bg-accent-primary-500 flex justify-between lg:px-0 md:px-8 px-3 lg:grid lg:grid-cols-3 text-white">
            <div className="hidden lg:block" />
            <div className="flex flex-col justify-center">
                <h2 className="text-sm md:text-2xl font-bold leading-snug">
                    Don’t miss what’s happening
                </h2>
                <p className="leading-snug text-xs md:text-base">
                    People on Twatter are the first to know.
                </p>
            </div>
            <div className="flex gap-2 justify-center items-center">
                <button
                    onClick={() => {
                        signIn().catch((e) => console.error(e));
                    }}
                    className="border-white hover:bg-white/10 transition-colors duration-500 border-[1px] px-2 lg:px-4 py-1 font-semibold rounded-full text-sm lg:text-base"
                >
                    Log in
                </button>
                <button
                    onClick={() => {
                        signIn().catch((e) => console.error(e));
                    }}
                    className="bg-white hover:bg-gray-200 transition-colors duration-500 text-black px-2 lg:px-4 py-1 font-semibold rounded-full text-sm lg:text-base"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}
