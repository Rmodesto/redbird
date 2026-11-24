import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Station page palette. Signage-derived: a near-black ground with a
        // white paper panel inset into it.
        station: {
          ground: "#0B0B0B",
          panel: "#161616",
          grid: "#262626",
          paper: "#FFFFFF",
          ink: "#111111",
          muted: "#5C5C5C",
          dim: "#8A8A8A",
          rule: "#E5E5E5",
          accent: "#F7931E",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            figure: {
              marginTop: '0',
              marginBottom: '0',
            },
            'figure img': {
              marginTop: '0',
              marginBottom: '0',
            },
            figcaption: {
              marginTop: '0.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
