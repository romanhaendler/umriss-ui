import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { clientDirective } from "../../scripts/styles/useClient.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* clientDirective() after importOwnCss(): the directive goes in front of the stylesheet import. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("table.js", "table.css"), clientDirective()],
  build: {
    lib: {
      /* The main entry is called `index` so that the types come out as
         `index.d.ts`; its JavaScript keeps the name `table.js`. The XLSX writer
         is an entry of its own, so an application that never imports it never
         pays for it (ADR-0019). */
      entry: { index: "src/index.ts", xlsx: "src/xlsx/index.ts" },
      formats: ["es"],
      fileName: (_format, entryName) => (entryName === "index" ? "table.js" : `${entryName}.js`),
    },
    /* The syntax the sources are written in (tsconfig `target`): no helper is
       shipped for what an application's own target decides. */
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core is a peer, like React: it comes from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core"],
      output: { assetFileNames: "table.[ext]" },
    },
  },
});
