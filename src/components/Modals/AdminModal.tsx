import { XMarkIcon } from "@heroicons/react/20/solid";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useMemo, useCallback, useState, useEffect } from "react";

import { useModal } from "~/components/Handlers/ModalHandler";

import { api } from "~/utils/api";
import {
    PERMISSIONS,
    getPermission,
    getPermissionList,
    hasPermission,
    permissionDependants,
    removePermission as _removePermissions,
    getPermissions,
    getAllPermissions,
    addPermission as _addPermission,
} from "~/utils/permission";

export default function AdminModal({
    userId,
    onMutate,
}: {
    userId: string;
    onMutate?: (user: User) => void;
}) {
    const { closeModal } = useModal();
    const { data: session } = useSession();

    const [activeTab, setActiveTab] = useState(0);

    const { data: user, refetch: _refetchUser } = api.admin.getUser.useQuery({
        id: userId,
    });
    const { data: rolesList } = api.role.getRoles.useQuery(
        {},
        {
            enabled: hasPermission(
                session?.user ?? { permissions: "0", roles: [] },
                PERMISSIONS.MANAGE_USER_ROLES,
            ),
        },
    );

    const [userRoles, setUserRoles] = useState<string[]>([]);
    const areRolesModified = useMemo(() => {
        if (!user) return false;

        const curRoles = user.roles.map((r) => r.id);

        return curRoles.sort().join(",") !== userRoles.sort().join(",");
    }, [userRoles, user]);

    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const arePermissionsModified = useMemo(() => {
        if (!user) return false;

        const curPerms = getPermissionList(user);

        return curPerms.sort().join(",") !== userPermissions.sort().join(",");
    }, [userPermissions, user]);

    useEffect(() => {
        if (user?.permissions) setUserPermissions(getPermissionList(user));
    }, [user]);

    useEffect(() => {
        if (user?.roles) setUserRoles(user.roles.map((r) => r.id));
    }, [user?.roles]);

    const removePermissions = useCallback<(perm: string) => void>(
        (perm) =>
            setUserPermissions(
                getPermissionList({
                    permissions: _removePermissions(
                        {
                            permissions:
                                getPermissions(userPermissions).toString(),
                            roles: [],
                        },
                        getPermission(perm)!,
                    ).toString(),
                    roles: [],
                }),
            ),
        [userPermissions],
    );

    const addPermission = useCallback<(perm: string) => void>(
        (perm) =>
            setUserPermissions(
                getPermissionList({
                    permissions: _addPermission(
                        {
                            permissions:
                                getPermissions(userPermissions).toString(),
                            roles: [],
                        },
                        getPermission(perm)!,
                    ).toString(),
                    roles: [],
                }),
            ),
        [userPermissions],
    );

    const refetchUser = useCallback(() => {
        _refetchUser().catch(console.error);
    }, [_refetchUser]);

    const { mutate: _verifyUser, isLoading: isVerifying } =
        api.admin.setUserVerification.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
            },
        });

    const { mutate: _setTagCooldown, isLoading: isResetting } =
        api.admin.setUserTagCooldown.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
            },
        });

    const { mutate: _setPermissions, isLoading: isSettingPermissions } =
        api.admin.updateUserPermissions.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
                setUserPermissions(getPermissionList(data));
            },
            onError: (err) => alert(`${err.message}`),
        });

    const { mutate: _updateUserRoles, isLoading: isUpdatingRoles } =
        api.admin.updateUserRoles.useMutation({
            onSuccess: (data) => {
                onMutate?.(data);
                refetchUser();
                setUserRoles(data.roles.map((r) => r.id));
            },
            onError: (err) => alert(`${err.message}`),
        });

    const verifyUser = useCallback<(shouldVerify: boolean) => void>(() => {
        _verifyUser({ id: user!.id, shouldVerify: !user?.verified });
    }, [_verifyUser, user]);

    const resetTagCooldown = useCallback<(newDate?: Date) => void>(
        (newDate) => {
            _setTagCooldown({ id: user!.id, newDate: newDate ?? new Date(0) });
        },
        [_setTagCooldown, user],
    );

    const applyPermissions = useCallback<() => void>(
        () =>
            _setPermissions({
                id: user!.id,
                permissions: getPermissions(userPermissions).toString(),
            }),
        [user, userPermissions, _setPermissions],
    );

    const applyRoles = useCallback<() => void>(
        () =>
            _updateUserRoles({
                id: user!.id,
                roles: userRoles,
            }),
        [user, userRoles, _updateUserRoles],
    );

    const userRolesList = useMemo<
        {
            name: string;
            id: string;
            permissions: string;
            createdAt: Date;
            updatedAt: Date;
        }[]
    >(
        () => rolesList?.filter((r) => userRoles.includes(r.id)) ?? [],
        [rolesList, userRoles],
    );

    const userPermissionsWithRoles = useMemo<string[]>(
        () => [
            ...new Set([
                ...userPermissions,
                ...getPermissionList({
                    permissions: "0",
                    roles: userRolesList,
                }),
            ]),
        ],
        [userPermissions, userRolesList],
    );

    const menuOptions = useMemo<
        { name: string; element: (user: User) => JSX.Element }[]
    >(
        () => [
            {
                name: "Overview",
                element: (_user) => (
                    <div className="w-full h-full flex flex-col gap-4 p-4">
                        <div>
                            <p className="text-black dark:text-white">
                                Verified:{" "}
                                <span
                                    className={`${
                                        _user.verified
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {_user.verified ? "Yes" : "No"}
                                </span>
                            </p>
                            {session &&
                                hasPermission(
                                    session.user,
                                    PERMISSIONS.MANAGE_USERS_EXTENDED,
                                ) && (
                                    <button
                                        className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                        onClick={() =>
                                            verifyUser(!_user?.verified)
                                        }
                                        disabled={isVerifying}
                                    >
                                        {!_user?.verified
                                            ? "Verify User"
                                            : "Unverify User"}
                                    </button>
                                )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-black dark:text-white">
                                Latest Tag Reset:{" "}
                                <span
                                    className={
                                        new Date(
                                            new Date(
                                                _user.lastTagReset,
                                            ).getTime() +
                                                30 * 24 * 60 * 60 * 1000,
                                        ) < new Date()
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }
                                >
                                    {new Date(
                                        new Date(_user.lastTagReset).getTime() +
                                            30 * 24 * 60 * 60 * 1000,
                                    ).toLocaleString() ?? "N/A"}
                                </span>
                            </p>
                            {session &&
                                hasPermission(
                                    session.user,
                                    PERMISSIONS.MANAGE_USERS,
                                ) && (
                                    <>
                                        <button
                                            className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                            onClick={() => resetTagCooldown()}
                                            disabled={isResetting}
                                        >
                                            Reset Cooldown
                                        </button>
                                        <button
                                            className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                            onClick={() =>
                                                resetTagCooldown(new Date())
                                            }
                                            disabled={isResetting}
                                        >
                                            Set Cooldown
                                        </button>
                                    </>
                                )}
                        </div>
                        {session &&
                            hasPermission(
                                session.user,
                                PERMISSIONS.MANAGE_USER_ROLES,
                            ) && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-black dark:text-white">
                                            User Permissions:
                                        </p>
                                        <div className="w-4/6 flex flex-wrap items-center px-3 py-2 gap-y-1 gap-x-1">
                                            {getAllPermissions()
                                                .filter(
                                                    (v) =>
                                                        !userPermissionsWithRoles.includes(
                                                            v,
                                                        ),
                                                )
                                                .sort(
                                                    (p1, p2) =>
                                                        p1.length - p2.length,
                                                )
                                                .map((p, idx) => (
                                                    <p
                                                        key={`${p}-${idx}`}
                                                        className={`bg-black dark:bg-white text-white dark:text-black px-2 select-none text-sm rounded-full relative cursor-pointer`}
                                                        onClick={() =>
                                                            addPermission(p)
                                                        }
                                                    >
                                                        {p}
                                                    </p>
                                                ))}
                                        </div>
                                        <div className="w-4/6 flex flex-wrap items-center px-3 py-2 gap-y-1 gap-x-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl">
                                            {userPermissionsWithRoles
                                                .sort(
                                                    (p1, p2) =>
                                                        p1.length - p2.length,
                                                )
                                                .map((p, idx) => {
                                                    const dependants =
                                                        permissionDependants(
                                                            getPermission(p)!,
                                                        );
                                                    const isDependant =
                                                        dependants.length > 0 &&
                                                        dependants.some((d) =>
                                                            userPermissions.includes(
                                                                d,
                                                            ),
                                                        );

                                                    const isInherited =
                                                        hasPermission(
                                                            {
                                                                permissions:
                                                                    "0",
                                                                roles: userRolesList,
                                                            },
                                                            getPermission(p)!,
                                                        );

                                                    return (
                                                        <p
                                                            key={`${p}-${idx}`}
                                                            className={`bg-black dark:bg-white text-white select-none dark:text-black pl-2 pr-6 text-sm rounded-full relative ${
                                                                isDependant
                                                                    ? "!bg-red-800"
                                                                    : ""
                                                            } ${
                                                                isInherited
                                                                    ? "!bg-green-800"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {p}
                                                            <span
                                                                className={`absolute right-1 top-0 bottom-0 w-4 my-[auto] flex cursor-pointer items-center ${
                                                                    isDependant ||
                                                                    isInherited
                                                                        ? "!cursor-default"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    !isDependant &&
                                                                    removePermissions(
                                                                        p,
                                                                    )
                                                                }
                                                            >
                                                                <XMarkIcon className="text-white dark:text-black w-full" />
                                                            </span>
                                                        </p>
                                                    );
                                                })}
                                        </div>
                                        <button
                                            className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                            onClick={() => applyPermissions()}
                                            disabled={
                                                isSettingPermissions ||
                                                !arePermissionsModified
                                            }
                                        >
                                            Apply Permissions
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-black dark:text-white">
                                            User Roles:
                                        </p>
                                        <div className="w-4/6 flex flex-wrap items-center px-3 py-2 gap-y-1 gap-x-1">
                                            {rolesList
                                                ?.filter(
                                                    (r) =>
                                                        userRoles.findIndex(
                                                            (u) => u === r.id,
                                                        ) === -1,
                                                )
                                                .sort(
                                                    (p1, p2) =>
                                                        p1.name.length -
                                                        p2.name.length,
                                                )
                                                .map((r) => (
                                                    <p
                                                        key={r.id}
                                                        className={`bg-black dark:bg-white text-white dark:text-black px-2 select-none text-sm rounded-full relative cursor-pointer`}
                                                        onClick={() =>
                                                            setUserRoles(
                                                                (roles) => [
                                                                    ...roles,
                                                                    r.id,
                                                                ],
                                                            )
                                                        }
                                                    >
                                                        {r.name}
                                                    </p>
                                                ))}
                                        </div>
                                        <div className="w-4/6 flex flex-wrap items-center px-3 py-2 gap-y-1 gap-x-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl">
                                            {userRolesList
                                                .sort(
                                                    (p1, p2) =>
                                                        p1.name.length -
                                                        p2.name.length,
                                                )
                                                .map((r) => (
                                                    <p
                                                        key={r.id}
                                                        className={`bg-black dark:bg-white text-white select-none dark:text-black pl-2 pr-6 text-sm rounded-full relative`}
                                                    >
                                                        {r.name}
                                                        <span
                                                            className={`absolute right-1 top-0 bottom-0 w-4 my-[auto] flex cursor-pointer items-center`}
                                                            onClick={() =>
                                                                setUserRoles(
                                                                    (roles) =>
                                                                        roles.filter(
                                                                            (
                                                                                role,
                                                                            ) =>
                                                                                role !==
                                                                                r.id,
                                                                        ),
                                                                )
                                                            }
                                                        >
                                                            <XMarkIcon className="text-white dark:text-black w-full" />
                                                        </span>
                                                    </p>
                                                ))}
                                        </div>
                                        <button
                                            onClick={() => applyRoles()}
                                            disabled={
                                                isUpdatingRoles ||
                                                !areRolesModified
                                            }
                                            className="py-1 px-2 bg-black dark:bg-white dark:text-black text-white rounded-lg w-min whitespace-nowrap disabled:bg-black/20 dark:disabled:bg-white/80"
                                        >
                                            Apply Roles
                                        </button>
                                    </div>
                                </>
                            )}
                    </div>
                ),
            },
            {
                name: "Info",
                element: () => <></>,
            },
        ],
        [
            isVerifying,
            verifyUser,
            isResetting,
            resetTagCooldown,
            session,
            userPermissions,
            addPermission,
            removePermissions,
            applyPermissions,
            arePermissionsModified,
            isSettingPermissions,
            rolesList,
            userRoles,
            userRolesList,
            applyRoles,
            isUpdatingRoles,
            areRolesModified,
            userPermissionsWithRoles,
        ],
    );

    return (
        <div className="w-6/12 md:w-9/12 h-4/6 bg-white dark:bg-neutral-900 shadow-xl rounded-lg flex relative overflow-hidden">
            <div
                className={
                    "w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/10 absolute top-2 right-2"
                }
                onClick={() => closeModal()}
            >
                <XMarkIcon className={"text-black dark:text-white"} />
            </div>
            <div className="flex grow-0 w-min h-full py-4 border-gray-200 dark:border-gray-700 border-r-[1px] overflow-x-hidden overflow-y-auto">
                <div className="h-full w-full min-w-[8rem] flex flex-col gap-1 whitespace-nowrap">
                    {menuOptions.map((option, idx) => (
                        <a
                            onClick={() => setActiveTab(idx)}
                            key={`admMenu-nav-${option.name}`}
                            className={`text-xl text-black dark:text-white cursor-pointer grow-0 py-1 pl-4 w-full hover:bg-white/10 ${
                                activeTab === idx ? "font-semibold" : ""
                            }`}
                        >
                            {option.name}
                        </a>
                    ))}
                </div>
            </div>
            {user ? (
                <div className="grow">
                    {menuOptions[activeTab]!.element(user)}
                </div>
            ) : (
                <div className="w-full h-full flex justify-center items-center">
                    <p className="text-black dark:text-white">Loading...</p>
                </div>
            )}
        </div>
    );
}
