import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownBox, ownCorners } from "../../scripts/styles/ownBox.ts";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("table.js", "table.css")],
  /* box-sizing and squircle corners on the library's own elements, and only
     there (ADR-0021). */
  css: { postcss: { plugins: [ownBox(), ownCorners()] } },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "table",
    },
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core is a peer, like React: it comes from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core"],
      output: { assetFileNames: "table.[ext]" },
    },
  },
});
