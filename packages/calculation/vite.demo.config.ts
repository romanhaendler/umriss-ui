import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

/* The demo of @umriss-ui/calculation. It runs against the source of
   @umriss-ui/core, as the typecheck and the unit tests do (tsconfig.json,
   vitest.config.ts): the rule from ADR-0016 concerns imports, not where the
   resolver finds them. */
export default defineConfig({
  root: "demo",
  plugins: [react(), ownStyles()],
  resolve: {
    alias: [
      /* The German wording, for the example that shows it - the subpath first,
         or the entry's alias would swallow it. */
      { find: /^@umriss-ui\/core\/wording\/de$/, replacement: fileURLToPath(new URL("../core/src/lib/language/de.ts", import.meta.url)) },
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
