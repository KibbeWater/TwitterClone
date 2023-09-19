import { useRouter } from "next/router";
import Layout from "~/components/Site/Layout";

import { api } from "~/utils/api";

export default function Home() {
    const tag = useRouter().query.tag as string;

    const { data: user, isError } = api.user.getProfile.useQuery({ tag });

    return (
        <Layout title="Home">
            <h1>
                Your username is{" "}
                {user?.name ?? (isError ? "NOTFOUND" : "loading...")} (@
                {user?.tag ?? (isError ? "NOTFOUND" : "loading...")})
            </h1>
            <h1>Verified?: {user?.verified ? "✅" : "❌"}</h1>
        </Layout>
    );
}
