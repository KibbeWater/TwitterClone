export default function PostSkeleton() {
    return (
        <div
            className={`p-3 mb-px w-full max-w-full relative bg-transparent border-b-[1px] flex animate-pulse`}
        >
            <div className="w-12 h-12 relative shrink-0">
                <div className="w-12 h-12 absolute rounded-full object-cover bg-gray-500" />
            </div>

            <div className={"pl-3 w-full flex flex-col overflow-hidden"}>
                <div
                    className={
                        "max-w-full w-full pr-9 flex-nowrap flex overflow-hidden items-center mb-2"
                    }
                >
                    <div
                        className={
                            "mr-[5px] w-3/12 h-[1em] bg-gray-500 rounded-lg"
                        }
                    />
                    <div
                        className={
                            "ml-[2px] h-[1em] w-2/12 bg-gray-500 rounded-lg"
                        }
                    />
                    <span className="mx-[6px] text-gray-500">·</span>
                    <div className={"w-4/12 h-[1em] bg-gray-500 rounded-lg"} />
                </div>
                <div className="flex flex-col w-full max-w-full gap-2">
                    <div className="w-10/12 h-[1em] bg-gray-500 rounded-lg" />
                    <div className="w-7/12 h-[1em] bg-gray-500 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
