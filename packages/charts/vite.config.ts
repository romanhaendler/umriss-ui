import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownBox, ownCorners } from "../../scripts/styles/ownBox.ts";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], rollupTypes: true }), importOwnCss("charts.js", "charts.css")],
  /* box-sizing and squircle corners on the library's own elements, and only
     there (ADR-0021). */
  css: { postcss: { plugins: [ownBox(), ownCorners()] } },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "charts",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { assetFileNames: "charts.[ext]" },
    },
  },
});
