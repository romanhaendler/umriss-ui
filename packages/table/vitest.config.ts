import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/* The same time zone as in @umriss-ui/core: the formats of the language seam
   hang on it. */
process.env.TZ = "Europe/Berlin";

export default defineConfig({
  plugins: [react()],
  resolve: {
    /* The tests run against the source of @umriss-ui/core - for the same
       reason as the typecheck (tsconfig.json). */
    /* Anchored patterns, and the subpath first: a bare string alias also
       matches everything under it, and would rewrite `@umriss-ui/core/wording/
       de` into a path inside `index.ts`. */
    alias: [
      {
        find: /^@umriss-ui\/core\/wording\/de$/,
        replacement: fileURLToPath(new URL("../core/src/lib/language/de.ts", import.meta.url)),
      },
      {
        find: /^@umriss-ui\/core$/,
        replacement: fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    include: ["tests-unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests-unit/setup.ts"],
    css: true,
  },
});
