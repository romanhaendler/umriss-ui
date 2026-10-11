import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { clientDirective } from "../../scripts/styles/useClient.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* clientDirective() after importOwnCss(): the directive goes in front of the stylesheet import. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("calculation.js", "calculation.css"), clientDirective()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "calculation",
    },
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core is a peer, like React: it comes from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core"],
      output: { assetFileNames: "calculation.[ext]" },
    },
  },
});
