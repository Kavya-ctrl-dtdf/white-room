import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        wall: "#F3F5F7",
        ink: "#18212B",
        graphite: "#5B6672",
        line: "#E2E6EA",
        seal: "#0E7C66",
        sealsoft: "#E6F2EF",
        alert: "#B4442C",
        alertsoft: "#FBEDE9",
        amber: "#9A6A00",
        ambersoft: "#FBF3DD",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Instrument Sans Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "76rem" },
    },
  },
  plugins: [],
};

export default config;
