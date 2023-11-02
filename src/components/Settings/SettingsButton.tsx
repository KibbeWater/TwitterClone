type Props = {
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
};

export default function SettingsButton({
    disabled,
    onClick,
    children,
    className,
}: Props) {
    return (
        <button
            onClick={() => onClick?.()}
            disabled={disabled}
            className={[
                "flex items-center justify-center bg-transparent hover:bg-red-800/10 px-3 py-3 text-red-600",
                "disabled:text-red-800 transition-colors w-full text-sm",
                className,
            ].join(" ")}
        >
            {children}
        </button>
    );
}
