import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true }), importOwnCss("charts.js", "charts.css")],
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
