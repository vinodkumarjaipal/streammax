/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                streammax: {
                    bg: '#0f1014',
                    accent: '#dc2626', // Neon red
                    card: '#1a1c23',
                }
            },
        },
    },
    plugins: [],
};