import type { Config } from "tailwindcss";
import base from "../tailwind.config";

// Same theme as the app, but content is scoped to what the design system ships:
// the synced components, the libs they pull class strings from, and the authored
// previews. Run the CLI from the repo root so these globs resolve.
const config: Config = {
  ...base,
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./.design-sync/previews/**/*.{ts,tsx}",
  ],
};

export default config;
