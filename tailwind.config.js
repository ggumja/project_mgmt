/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "#e2e8f0", // slate-200
                input: "#e2e8f0", // slate-200
                ring: "#2563eb", // blue-600
                background: "#ffffff",
                foreground: "#0f172a", // slate-900
                primary: {
                    DEFAULT: "#2563eb", // blue-600
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#f1f5f9", // slate-100
                    foreground: "#0f172a", // slate-900
                },
                destructive: {
                    DEFAULT: "#ef4444", // red-500
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#f8fafc", // slate-50
                    foreground: "#64748b", // slate-500
                },
                accent: {
                    DEFAULT: "#f1f5f9", // slate-100
                    foreground: "#0f172a", // slate-900
                },
                popover: {
                    DEFAULT: "#ffffff",
                    foreground: "#0f172a",
                },
                card: {
                    DEFAULT: "#ffffff",
                    foreground: "#0f172a",
                },
            },
            borderRadius: {
                lg: "0.5rem",
                md: "calc(0.5rem - 2px)",
                sm: "calc(0.5rem - 4px)",
            },
        },
    },
    plugins: [],
}
