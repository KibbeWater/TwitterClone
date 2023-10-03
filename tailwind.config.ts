import { type Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                accent: {
                    primary: {
                        700: "rgb(219, 27, 27)",
                        500: "rgb(240, 29, 29)",
                    },
                },
            },
        },
    },
    darkMode: "class",
    plugins: [require("tailwind-scrollbar-hide")],
} satisfies Config;
