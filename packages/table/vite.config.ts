import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("table.js", "table.css")],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "table",
    },
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core is a peer, like React: it comes from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core"],
      output: { assetFileNames: "table.[ext]" },
    },
  },
});
