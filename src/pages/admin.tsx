import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";

import Layout from "~/components/Site/Layouts/Layout";
import UserContext from "~/components/UserContext";

import { authOptions, getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { PERMISSIONS, hasPermission } from "~/utils/permission";

type UserProp = {
    id: string;
    name?: string | null;
    permissions: string;
};

export const getServerSideProps = (async (ctx) => {
    let user: UserProp | undefined;
    try {
        const tempUser = (await getServerAuthSession(ctx))?.user;

        // Sanitize user object, dateTime will error out the request
        user = tempUser && {
            id: tempUser.id,
            name: tempUser.name,
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
    const { data: administrators } = api.admin.getAdministrators.useQuery(
        {},
        { enabled: hasPermission(user, PERMISSIONS.MANAGE_USER_ROLES) },
    );

    return (
        <Layout title="Admin">
            <div className="flex flex-col mt-4 px-4">
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
            </div>
        </Layout>
    );
}
