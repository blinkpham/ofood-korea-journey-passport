import { defineConfig } from "vite";

// Relative base so the production build runs from any static host or subpath
// (GitHub Pages project site, Vercel, or opening dist/index.html directly).
export default defineConfig({
  base: "./"
});
