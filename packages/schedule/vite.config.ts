import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("schedule.js", "schedule.css")],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "schedule",
    },
    cssCodeSplit: false,
    rollupOptions: {
      /* Both peers are external, like React: they come from the caller and
         stand exactly once in the bundle of their application (ADR-0022). */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core", "@umriss-ui/charts"],
      output: { assetFileNames: "schedule.[ext]" },
    },
  },
});
