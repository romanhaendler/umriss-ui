import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";
import { fileURLToPath } from "node:url";

/* The same time zone as in @umriss-ui/core and @umriss-ui/table: the day
   boundaries of the coarse band and the formats hang on it. */
process.env.TZ = "Europe/Berlin";

export default defineConfig({
  plugins: [react(), ownStyles()],
  resolve: {
    /* The tests run against the sources of both peers - for the same reason as
       the typecheck (tsconfig.json). Anchored patterns, and the subpath first. */
    alias: [
      {
        find: /^@umriss-ui\/core\/wording\/de$/,
        replacement: fileURLToPath(new URL("../core/src/lib/language/de.ts", import.meta.url)),
      },
      {
        find: /^@umriss-ui\/core$/,
        replacement: fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      },
      {
        find: /^@umriss-ui\/charts$/,
        replacement: fileURLToPath(new URL("../charts/src/index.ts", import.meta.url)),
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
