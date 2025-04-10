/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    safelist: [
        'pb-safe',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require("tailwindcss-safe-area"),
    ],
}

