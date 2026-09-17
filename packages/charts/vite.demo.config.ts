import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { ownBox } from "../../scripts/styles/ownBox.ts";

/* The demo of @umriss-ui/charts. It runs in the shared shell (ADR-0020) and
   therefore against the source of @umriss-ui/core, exactly as the demo of
   @umriss-ui/table does: R-1.2 binds `packages/charts/src/**`, which is what is
   published, and not the demo. */
export default defineConfig({
  root: "demo",
  plugins: [react()],
  /* The same box model the library build gives its own elements (ADR-0021):
     the demo runs the sources, and it has to run what ships. */
  css: { postcss: { plugins: [ownBox()] } },
  resolve: {
    alias: [
      { find: /^@umriss-ui\/core$/, replacement: fileURLToPath(new URL("../core/src/index.ts", import.meta.url)) },
      /* The package's stylesheet exists only once it has been built. In its
         place the token and base layer; the components' styles come with
         their modules. */
      { find: /^@umriss-ui\/core\/styles\.css$/, replacement: fileURLToPath(new URL("./demo/ui-styles.css", import.meta.url)) },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
