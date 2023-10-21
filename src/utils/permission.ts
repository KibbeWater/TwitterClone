type UserProp = {
    permissions: string;
    roles: RoleProp[];
};

type RoleProp = {
    permissions: string;
};

export const DEFAULT_PERMISSIONS = 0n;

const setBit = (value: bigint, bitPos: number) =>
    value | (1n << BigInt(bitPos));

// A bigint has 52 bits???
export const PERMISSIONS = {
    MANAGE_USERS: setBit(0n, 0),
    MANAGE_USERS_EXTENDED: setBit(0n, 1) | setBit(0n, 0),
    VIEW_PROTECTED_USERS: setBit(0n, 2),
    MANAGE_USER_ROLES: setBit(0n, 4),
    MANAGE_ROLES: setBit(0n, 5),

    MANAGE_POSTS: setBit(0n, 3),

    ADMINISTRATOR: setBit(0n, 52), // All permissions, use with caution
};

export const administrativePermissions = [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_USERS_EXTENDED,
    PERMISSIONS.VIEW_PROTECTED_USERS,
    PERMISSIONS.MANAGE_USER_ROLES,
    PERMISSIONS.MANAGE_POSTS,
    PERMISSIONS.MANAGE_ROLES,
];

export const hasPermission = (
    user: UserProp,
    permissions: bigint | bigint[],
    or?: boolean,
    ignoreAdministrator?: boolean,
): boolean => {
    if (ignoreAdministrator && hasPermission(user, PERMISSIONS.ADMINISTRATOR))
        return true;

    const combinedPermissionsToCheck = Array.isArray(permissions)
        ? permissions.reduce((acc, cur) => acc | cur, 0n)
        : permissions;

    // Get the users actual permissions
    const userPermission =
        BigInt(user.permissions) |
        (user.roles ? evaluateRolePermissions(user.roles) : 0n);

    if (!or)
        return (
            (userPermission & combinedPermissionsToCheck) ===
            combinedPermissionsToCheck
        );
    else
        return Array.isArray(permissions)
            ? permissions.some((p) => (p & userPermission) === p)
            : (userPermission & permissions) === permissions;
};

export const getPermission = (permission: string): bigint | null =>
    Object.entries(PERMISSIONS).find(([key]) => key === permission)?.[1] ??
    null;

export const getPermissions = (permissions: string[]): bigint => {
    const res = permissions.reduce(
        (acc, cur) => acc | (getPermission(cur) ?? 0n),
        0n,
    );
    return res;
};

export const getPermissionList = (user: UserProp): string[] =>
    Object.entries(PERMISSIONS)
        .map(([key, value]) =>
            hasPermission(user, value, false, true) ? key : null,
        )
        .filter((x) => x !== null) as string[];

export const getAllPermissions = (): string[] => Object.keys(PERMISSIONS);

export const permissionDependencies = (permission: bigint): string[] => {
    const permissions = getAllPermissions().filter(
        (p) =>
            (getPermission(p)! & permission) === getPermission(p)! &&
            getPermission(p)! !== permission,
    );

    return permissions;
};

export const permissionDependants = (permission: bigint): string[] => {
    const permissions = getAllPermissions().filter(
        (p) =>
            (getPermission(p)! & permission) === permission &&
            getPermission(p)! !== permission,
    );

    return permissions;
};

export const addPermission = (user: UserProp, permission: bigint): bigint =>
    BigInt(user.permissions) | permission;

export const removePermission = (user: UserProp, permission: bigint): bigint =>
    permissionDependants(permission).reduce(
        (acc, cur) => acc & ~getPermission(cur)!,
        BigInt(user.permissions),
    ) & ~permission;

export const evaluateRolePermissions = (role: RoleProp | RoleProp[]): bigint =>
    Array.isArray(role)
        ? role.reduce((acc, cur) => acc | BigInt(cur.permissions), 0n)
        : BigInt(role.permissions);
