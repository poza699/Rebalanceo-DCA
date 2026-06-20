/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        floatA: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(40px, -30px) scale(1.08)" },
        },
        floatB: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(-50px, 40px) scale(1.05)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.5 },
          "50%": { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floatA: "floatA 14s ease-in-out infinite",
        floatB: "floatB 18s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
