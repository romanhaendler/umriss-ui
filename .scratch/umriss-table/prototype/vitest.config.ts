import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const ui = (pfad: string) => fileURLToPath(new URL(`../../../packages/ui/node_modules/${pfad}`, import.meta.url));

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^react$/, replacement: ui("react/index.js") },
      { find: /^react\/jsx-runtime$/, replacement: ui("react/jsx-runtime.js") },
      { find: /^react\/jsx-dev-runtime$/, replacement: ui("react/jsx-dev-runtime.js") },
      { find: /^react-dom$/, replacement: ui("react-dom/index.js") },
      { find: /^react-dom\/client$/, replacement: ui("react-dom/client.js") },
      { find: /^react-dom\/test-utils$/, replacement: ui("react-dom/test-utils.js") },
    ],
  },
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    include: ["laufzeit/**/*.test.tsx"],
    environment: "jsdom",
    server: { deps: { inline: [/@testing-library/] } },
  },
});
