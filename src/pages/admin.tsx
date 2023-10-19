import { XMarkIcon } from "@heroicons/react/20/solid";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useCallback, useState, useMemo } from "react";

import Layout from "~/components/Site/Layouts/Layout";
import UserContext from "~/components/UserContext";

import { authOptions, getServerAuthSession } from "~/server/auth";
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

type UserProp = {
    id: string;
    name?: string | null;
    permissions: string;
    roles: { permissions: string }[];
};

export const getServerSideProps = (async (ctx) => {
    let user: UserProp | undefined;
    try {
        const tempUser = (await getServerAuthSession(ctx))?.user;

        // Sanitize user object, dateTime will error out the request
        user = tempUser && {
            id: tempUser.id,
            name: tempUser.name,
            roles:
                tempUser.roles?.map((r) => ({
                    permissions: r.permissions,
                })) ?? [],
            permissions: tempUser.permissions,
        };
    } catch (error) {
        return {
            redirect: {
                destination: authOptions.pages?.signIn ?? "/",
                permanent: false,
            },
        };
    }

    if (
        !user ||
        !hasPermission(
            user,
            [
                PERMISSIONS.MANAGE_USERS,
                PERMISSIONS.MANAGE_USER_ROLES,
                PERMISSIONS.MANAGE_POSTS,
            ],
            true,
        )
    )
        return {
            redirect: {
                destination: authOptions.pages?.signIn ?? "/",
                permanent: false,
            },
        };

    return { props: { user } };
}) satisfies GetServerSideProps<{
    user: UserProp;
}>;

export default function Admin({
    user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [name, setName] = useState("");
    const [permissions, setPermissions] = useState<string[]>([]);

    const removePermissions = useCallback<(perm: string) => void>(
        (perm) =>
            setPermissions(
                getPermissionList({
                    permissions: _removePermissions(
                        {
                            permissions: getPermissions(permissions).toString(),
                            roles: [],
                        },
                        getPermission(perm)!,
                    ).toString(),
                    roles: [],
                }),
            ),
        [permissions],
    );

    const addPermission = useCallback<(perm: string) => void>(
        (perm) =>
            setPermissions(
                getPermissionList({
                    permissions: _addPermission(
                        {
                            permissions: getPermissions(permissions).toString(),
                            roles: [],
                        },
                        getPermission(perm)!,
                    ).toString(),
                    roles: [],
                }),
            ),
        [permissions],
    );

    const { data: roles, refetch: _reloadRoles } = api.role.getRoles.useQuery(
        {},
        { enabled: hasPermission(user, PERMISSIONS.MANAGE_ROLES) },
    );
    
    const { data: administrators } = api.admin.getAdministrators.useQuery(
        {},
        { enabled: hasPermission(user, PERMISSIONS.MANAGE_USER_ROLES) },
    );

    const selectRole = useCallback<(roleId: string) => void>(
        (roleId) => {
            const role = roles?.find((r) => r.id === roleId);
            if (!role) return;

            setName(role.name);
            setPermissions(
                getPermissionList({ permissions: role.permissions, roles: [] }),
            );
        },
        [roles],
    );

    const arePermissionsModified = useMemo(() => {
        if (!roles) return false;
        const selectedRole = roles.find((r) => r.name === name);

        const curPerms = getPermissionList({
            permissions: selectedRole?.permissions ?? "",
            roles: [],
        });

        return curPerms.sort().join(",") !== permissions.sort().join(",");
    }, [permissions, roles, name]);

    const { mutate: _createRole, isLoading: _isMutatingRoleCreate } =
        api.role.createRole.useMutation({
            onSuccess: () => _reloadRoles().catch(console.error),
            onError: (error) => {
                alert(error.message);
                const role = roles?.find((r) => r.name === name)?.id;
                if (role) selectRole(role);
            },
        });
    const { mutate: _updateRole, isLoading: _isMutatingRoleUpdate } =
        api.role.updateRole.useMutation({
            onSuccess: () => _reloadRoles().catch(console.error),
            onError: (error) => {
                alert(error.message);
                const role = roles?.find((r) => r.name === name)?.id;
                if (role) selectRole(role);
            },
        });

    const createRole = useCallback(() => {
        if (!name || !permissions) return;

        _createRole({
            name,
            permissions: getPermissions(permissions).toString(),
        });
    }, [_createRole, name, permissions]);

    const updateRole = useCallback(() => {
        if (!name || !permissions) return;
        if (roles?.findIndex((r) => name === r.name) === -1) return;

        _updateRole({
            name,
            permissions: getPermissions(permissions).toString(),
        });
    }, [_updateRole, name, permissions, roles]);

    const isMutatingRole = _isMutatingRoleCreate || _isMutatingRoleUpdate;

    return (
        <Layout title="Admin">
            <div className="flex flex-col mt-4 px-4 gap-4">
                {hasPermission(user, PERMISSIONS.MANAGE_USER_ROLES) && (
                    <div className="flex flex-col w-4/6">
                        <p className="text-lg font-semibold">Administrators:</p>
                        <div className="rounded-md overflow-hidden">
                            <div className="bg-neutral-100 dark:bg-neutral-900 w-full max-h-48 overflow-auto">
                                {administrators?.map((u) => (
                                    <Link
                                        key={`aU-${u.id}`}
                                        href={`/@${u.tag}`}
                                    >
                                        <UserContext user={u} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {hasPermission(user, PERMISSIONS.MANAGE_ROLES) && (
                    <div>
                        <div className="grid grid-cols-2 gap-6 w-full justify-center">
                            <div>
                                <p className="text-lg font-semibold">Roles:</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold">
                                    Options:
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 w-full">
                            <div className="flex flex-col">
                                <div className="bg-neutral-100 dark:bg-neutral-900 w-full max-h-48 overflow-auto rounded-md">
                                    {roles?.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => selectRole(r.id)}
                                            className="w-full h-12 flex items-center px-5 transition-colors hover:bg-black/20 dark:hover:bg-white/5"
                                        >
                                            <p>{r.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md">
                                <label className="text-sm flex-col flex">
                                    Name:
                                    <input
                                        value={name}
                                        className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md max-w-[14rem] pl-2"
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    ></input>
                                </label>
                                <div>
                                    <p>Roles:</p>
                                    {(() => {
                                        const unassignedPerms =
                                            getAllPermissions().filter(
                                                (v) => !permissions.includes(v),
                                            );

                                        if (unassignedPerms.length === 0)
                                            return undefined;

                                        return (
                                            <div className="flex flex-wrap items-center py-2 gap-y-1 gap-x-1">
                                                {unassignedPerms
                                                    .sort(
                                                        (p1, p2) =>
                                                            p1.length -
                                                            p2.length,
                                                    )
                                                    .map((p, idx) => (
                                                        <p
                                                            key={`${p}-${idx}`}
                                                            className={`bg-black dark:bg-white text-white dark:text-black px-2 text-sm rounded-full select-none relative cursor-pointer`}
                                                            onClick={() =>
                                                                addPermission(p)
                                                            }
                                                        >
                                                            {p}
                                                        </p>
                                                    ))}
                                            </div>
                                        );
                                    })()}
                                    <div className="flex flex-wrap items-center px-3 py-2 gap-y-1 gap-x-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl">
                                        {permissions
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
                                                        permissions.includes(d),
                                                    );

                                                return (
                                                    <p
                                                        key={`${p}-${idx}`}
                                                        className={`bg-black dark:bg-white text-white dark:text-black pl-2 pr-6 text-sm rounded-full select-none relative ${
                                                            isDependant
                                                                ? "!bg-red-800"
                                                                : ""
                                                        }`}
                                                    >
                                                        {p}
                                                        <span
                                                            className={`absolute right-1 top-0 bottom-0 w-4 my-[auto] flex cursor-pointer items-center ${
                                                                isDependant
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
                                </div>
                                <div className="flex justify-between gap-4">
                                    <button
                                        className={[
                                            "grow bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 duration-300 py-1 rounded-md",
                                            "disabled:bg-neutral-500 dark:disabled:bg-neutral-500 text-white dark:text-black transition-colors",
                                        ].join(" ")}
                                        onClick={createRole}
                                        disabled={
                                            roles?.findIndex(
                                                (r) => name === r.name,
                                            ) !== -1 ||
                                            isMutatingRole ||
                                            !name
                                        }
                                    >
                                        Create
                                    </button>
                                    <button
                                        disabled={
                                            roles?.findIndex(
                                                (r) => name === r.name,
                                            ) === -1 ||
                                            isMutatingRole ||
                                            !arePermissionsModified
                                        }
                                        className={[
                                            "grow bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 duration-300 py-1 rounded-md",
                                            "disabled:bg-neutral-500 dark:disabled:bg-neutral-500 text-white dark:text-black transition-colors",
                                        ].join(" ")}
                                        onClick={updateRole}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
