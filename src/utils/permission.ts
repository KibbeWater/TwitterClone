type UserProp = {
    permissions: bigint;
};

export const DEFAULT_PERMISSIONS = 0n;

const setBit = (value: bigint, bitPos: number) =>
    value | (1n << BigInt(bitPos));

// A bigint has 64 bits
export const PERMISSIONS = {
    MANAGE_USERS: setBit(0n, 0),
    MANAGE_USERS_EXTENDED: setBit(0n, 1) | setBit(0n, 0),
    VIEW_PROTECTED_USERS: setBit(0n, 2),
    MANAGE_USER_ROLES: setBit(0n, 4),

    MANAGE_POSTS: setBit(0n, 3),

    ADMINISTRATOR: 9007199254740991n, // All permissions, use with caution
};

export const hasPermission = (
    user: UserProp,
    permissions: bigint | bigint[],
    or?: boolean,
) =>
    typeof permissions === "bigint"
        ? (user.permissions & permissions) === permissions
        : or
        ? permissions.findIndex((p) => (user.permissions & p) === p) !== -1
        : permissions.every((p) => (user.permissions & p) === p);

export const getPermissionList = (user: UserProp): string[] =>
    Object.entries(PERMISSIONS)
        .map(([key, value]) => (hasPermission(user, value) ? key : null))
        .filter((x) => x !== null) as string[];
