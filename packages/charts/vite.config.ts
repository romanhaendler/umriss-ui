import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { clientDirective } from "../../scripts/styles/useClient.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* clientDirective() after importOwnCss(): the directive goes in front of the stylesheet import. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true }), importOwnCss("charts.js", "charts.css"), clientDirective()],
  build: {
    /* Two entries, as in core: the library, and the German wording as
       `./wording/de` (ADR-0031). `rollupTypes` writes the second's types flat
       as `dist/de.d.ts`, which is where package.json points. */
    lib: {
      entry: { index: "src/index.ts", "wording/de": "src/wording/de.ts" },
      formats: ["es"],
      fileName: (_format, entryName) => (entryName === "index" ? "charts.js" : `${entryName}.js`),
    },
    /* The syntax the sources are written in (tsconfig `target`): no helper is
       shipped for what an application's own target decides. */
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { assetFileNames: "charts.[ext]" },
    },
  },
});
