import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { importOwnCss } from "../../scripts/styles/importOwnCss.ts";
import { clientDirective } from "../../scripts/styles/useClient.ts";
import { ownStyles } from "../../scripts/styles/ownStyles.ts";

export default defineConfig({
  /* clientDirective() after importOwnCss(): the directive goes in front of the stylesheet import. */
  plugins: [react(), ownStyles(), dts({ include: ["src"], rollupTypes: true, tsconfigPath: "./tsconfig.build.json" }), importOwnCss("alarms.js", "alarms.css"), clientDirective()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "alarms",
    },
    /* The syntax the sources are written in (tsconfig `target`): no helper is
       shipped for what an application's own target decides. */
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: {
      /* @umriss-ui/core and @umriss-ui/table are peers, like React: they come from the caller and
         stands exactly once in the bundle of their application. */
      external: ["react", "react-dom", "react/jsx-runtime", "@umriss-ui/core", "@umriss-ui/table"],
      output: { assetFileNames: "alarms.[ext]" },
    },
  },
});
