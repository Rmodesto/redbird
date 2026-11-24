import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── "Deconstructed Sneaker" ──────────────────────────────────────────
      // The subwaysounds.net UI refresh. Spacing, type and layout run on the
      // golden ratio (φ = 1.618) and the Fibonacci sequence. Transcribed from
      // the design system's token sheet — change it there first.
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        jet: "#0B0B0B",
        suede: "#161616",
        ripstop: "#262626",
        graphite: "#8A8A8A",
        smoke: "rgba(70,70,70,0.55)",
        paper: "#FFFFFF",
        ink: "#111111",
        muted: "#5C5C5C",
        seam: "#E5E5E5",
        tag: "#F7931E",
      },
      spacing: {
        f2: "2px", f3: "3px", f5: "5px", f8: "8px", f13: "13px", f21: "21px",
        f34: "34px", f55: "55px", f89: "89px", f144: "144px", f233: "233px",
        f377: "377px", f610: "610px",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        micro: ["10px", { lineHeight: "16px", letterSpacing: "0.08em" }],
        label: ["13px", { lineHeight: "21px", letterSpacing: "0.08em" }],
        body: ["16px", "26px"],
        "body-lg": ["18px", "29px"],
        h4: ["21px", "26px"],
        h3: ["26px", "34px"],
        h2: ["34px", "42px"],
        h1: ["55px", { lineHeight: "55px", letterSpacing: "-0.02em" }],
        display: ["68px", { lineHeight: "68px", letterSpacing: "-0.02em" }],
        mega: ["89px", { lineHeight: "89px", letterSpacing: "-0.03em" }],
      },
      gridTemplateColumns: {
        golden: "minmax(0,1.618fr) minmax(0,1fr)",
        "golden-r": "minmax(0,1fr) minmax(0,1.618fr)",
        article: "610px 377px",
      },
      borderRadius: { seam: "2px" },
      backdropBlur: { smoke: "8px" },
      // Only the stitch tiles live here. `ripstop`, `suede` and `lace` are each
      // a colour AND a texture, and Tailwind shares the `bg-*` namespace across
      // backgroundColor / backgroundImage / backgroundSize — so `bg-ripstop`
      // would emit background-color:#262626 and swallow the jet ground beneath
      // the grid. Those three ship as `.surface-*` utilities in globals.css
      // instead, which set image, size and colour together as one decision.
      backgroundImage: {
        stitch: "url('/textures/stitch-white.svg')",
        "stitch-ink": "url('/textures/stitch-ink.svg')",
        "stitch-seam": "url('/textures/stitch-seam.svg')",
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
