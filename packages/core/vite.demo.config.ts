import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  root: "demo",
  plugins: [react(), ownStyles()],
  resolve: {
    /* The shell (@umriss-ui/demo) fetches @umriss-ui/core by its package name.
       Here that is our own source - the same file the examples fetch as
       `../src`, hence the same module and the same context. The bare name
       only: `@umriss-ui/core/styles.css` is a different path.

       The subpath rule stands before the bare one, as it does in
       vitest.config.ts: `@umriss-ui/core/wording/de` is the entry point an
       application writes (ADR-0019), and an example on the provider page
       writes it too - it is the import line the reader is meant to copy.
       Without the alias that import would reach for `dist/`, which need not
       exist when the demo is started. */
    alias: [
      {
        find: /^@umriss-ui\/core\/wording\/de$/,
        replacement: fileURLToPath(new URL("./src/lib/language/de.ts", import.meta.url)),
      },
      { find: /^@umriss-ui\/core$/, replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
    ],
    dedupe: ["react", "react-dom"],
  },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
