import { defineConfig } from "vitest/config";

/* The tooling is pure arithmetic over strings and the compiler; it needs no
   DOM. The shell itself renders in the three demos' smoke tests, where it has an
   outline and examples to render. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests-unit/**/*.test.{ts,tsx}"],
    /* A case that starts the compiler over a fixture or a whole package takes
       seconds on a busy machine - more than vitest's five. */
    testTimeout: 60_000,
  },
});
