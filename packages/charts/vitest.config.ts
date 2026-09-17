import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    /* The demo runs in the shared shell since ADR-0020, and the shell takes
       @umriss-ui/core. The jsdom smoke test of the demo therefore resolves it -
       against the SOURCE, as the typecheck does, because dist is not checked
       in. `src/` imports none of it; the lint holds that (R-1.2). */
    alias: [
      {
        find: /^@umriss-ui\/core$/,
        replacement: fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  test: {
    include: ["tests-unit/**/*.test.{ts,tsx}"],
    css: true,
    setupFiles: ["tests-unit/setup.ts"],
    environment: "node", // jsdom tests annotate themselves with // @vitest-environment jsdom
  },
});
