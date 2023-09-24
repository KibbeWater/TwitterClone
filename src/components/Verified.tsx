import { CheckBadgeIcon } from "@heroicons/react/20/solid";

export default function VerifiedCheck({ color }: { color?: string }) {
    return (
        <CheckBadgeIcon
            style={{ color: color ?? "#f01d1d" }}
            className="w-4 h-4 flex justify-center items-center"
        />
    );
}
