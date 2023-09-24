import { LazyMotion } from "framer-motion";

const loadFeatures = () =>
    import("~/utils/framerFeatures").then((res) => res.default);

export function LazyMotionWrapper({ children }: { children: React.ReactNode }) {
    return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
