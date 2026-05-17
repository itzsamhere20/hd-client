/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        luxury: ['"Playfair Display"', "serif"],
        cormorant: ['"Cormorant"', "serif"],
      },
      colors: {
        background: "#f1efec",
        primary: "#A68A3C",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-40px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        drift: "drift 12s ease-in-out infinite",
        driftSlow: "drift 18s ease-in-out infinite",
        driftFast: "drift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
