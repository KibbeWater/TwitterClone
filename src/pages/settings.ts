import type { GetServerSideProps } from "next";

import { authOptions, getServerAuthSession } from "~/server/auth";

export const getServerSideProps = (async (ctx) => {
    const session = await getServerAuthSession(ctx);

    if (!session)
        return {
            redirect: {
                destination: authOptions.pages?.signIn ?? "/",
                permanent: false,
            },
        };

    return {
        redirect: {
            destination: `/settings/account`,
            permanent: false,
        },
    };
}) satisfies GetServerSideProps;

export default function Page() {
    return;
}
