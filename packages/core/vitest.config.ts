import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";
import { fileURLToPath } from "node:url";

/* Pin the time zone: the daylight-saving tests check concrete transitions
   (29.03.2026 forwards, 25.10.2026 back) and have to run independently of
   where the machine stands. Set before the workers start, and inherited. */
process.env.TZ = "Europe/Berlin";

export default defineConfig({
  plugins: [react(), ownStyles()],
  resolve: {
    /* As in the demo build (vite.demo.config.ts): the shell fetches
       @umriss-ui/core by its package name, and here that is our own source. */
    /* The subpath rule stands before the bare one: `@umriss-ui/core/wording/de`
       is the entry point an application writes as well (ADR-0019). */
    alias: [
      {
        find: /^@umriss-ui\/core\/wording\/de$/,
        replacement: fileURLToPath(new URL("./src/lib/language/de.ts", import.meta.url)),
      },
      { find: /^@umriss-ui\/core$/, replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
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
