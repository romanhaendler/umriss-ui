import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* `rollupTypes` gathers the types of each entry into ONE file, and flatly at
     that: `dist/index.d.ts` for the entry point, `dist/de.d.ts` for the German
     wording. The `dist/wording/de.d.ts` that appears beside it is a forwarding
     to a path that does not exist in `dist` - which is why
     `exports["./wording/de"].types` in the package.json points at
     `./dist/de.d.ts` and not there. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true }), importOwnCss("core.js", "core.css")],
  build: {
    /* Two entries: the library, and the German wording as `./wording/de`. The
       second is a subpath rather than a name in the barrel so that an
       application which never imports it never pays for it (ADR-0019). */
    lib: {
      /* The main entry is called `index` so that the types keep coming out as
         `index.d.ts` (package.json `types`); its JavaScript keeps the name
         `core.js`. */
      entry: { index: "src/index.ts", "wording/de": "src/lib/language/de.ts" },
      formats: ["es"],
      fileName: (_format, entryName) => (entryName === "index" ? "core.js" : `${entryName}.js`),
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { assetFileNames: "core.[ext]" },
    },
  },
});
