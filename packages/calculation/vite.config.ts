import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { clientDirective } from "../../scripts/styles/useClient.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* The entry has no directive, so a Server Component runs the reader where the tree is written;
     the directive and the stylesheet import head the client file, which holds the view.
     clientDirective() after importOwnCss(): the directive goes in front of the stylesheet import. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("calculation.client.js", "calculation.css"), clientDirective(["calculation.client.js"])],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: (_, name) => `${name}.js`,
    },
    /* The syntax the sources are written in (tsconfig `target`): no helper is
       shipped for what an application's own target decides. */
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core is a peer, like React: it comes from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core"],
      input: { calculation: "src/index.ts", "calculation.client": "src/Calculation.tsx" },
      output: {
        assetFileNames: "calculation.[ext]",
        /* The model and the elements are used by the entry and the view alike. Left alone, Rollup
           pours them and the view into one shared chunk and the client file shrinks to a facade;
           apart, the client file holds the view and the entry imports it. */
        manualChunks: (id) => (/src\/(model|elements)\.tsx?$/.test(id) ? "calculation.model" : undefined),
      },
    },
  },
});
