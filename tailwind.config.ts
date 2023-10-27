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
                    border: {
                        dark: "#374151",
                        light: "#e5e7eb",
                    },
                },
                highlight: {
                    dark: "#262626",
                    light: "#e5e7eb",
                },
            },
        },
    },
    darkMode: "class",
    plugins: [require("tailwind-scrollbar-hide")],
} satisfies Config;
