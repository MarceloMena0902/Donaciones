/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        floatUpDown: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        float: "floatUpDown 3s ease-in-out infinite",
        floatFast: "floatUpDown 2.2s ease-in-out infinite",
        floatSlow: "floatUpDown 3.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
