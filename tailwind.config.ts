import { type Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                accent: {
                    primary: {
                        400: "rgb(219, 27, 27)",
                        500: "rgb(240, 29, 29)",
                    },
                },
            },
        },
    },
    plugins: [require("tailwind-scrollbar-hide")],
} satisfies Config;
