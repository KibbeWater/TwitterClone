import { env } from "~/env.mjs";

export function isPremium(user?: { roles: { id: string }[] }): boolean {
    if (!env.NEXT_PUBLIC_PREMIUM_ROLE || !user) return false;
    return user.roles.some((role) => role.id === env.NEXT_PUBLIC_PREMIUM_ROLE);
}
