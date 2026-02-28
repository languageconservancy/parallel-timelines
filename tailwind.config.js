/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

export default {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    safelist: ["pb-safe"],
    theme: {
        extend: {},
    },
    plugins: [
        require("tailwindcss-safe-area"),
        plugin(function ({ addUtilities }) {
            addUtilities({});
        }),
    ],
};
