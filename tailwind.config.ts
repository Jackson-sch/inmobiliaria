import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        linen: {
          DEFAULT: "#F8F6F1",
          deep: "#F1EDE4",
        },
        ink: {
          DEFAULT: "#1C1F1B",
          soft: "#4A4D47",
        },
        sage: {
          DEFAULT: "#7A8B72",
          deep: "#5F6F58",
        },
        bronze: {
          DEFAULT: "#B08D57",
        },
        stone: {
          DEFAULT: "#E3DED2",
          deep: "#CFC7B6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)"],
        body: ["var(--font-inter)"],
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
};

export default config;
