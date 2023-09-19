import { useRouter } from "next/router";
import Layout from "~/components/Site/Layout";

export default function Home() {
    const tag = useRouter().query.tag as string;

    return (
        <Layout title="Home">
            <h1>Your username is {tag}</h1>
        </Layout>
    );
}
