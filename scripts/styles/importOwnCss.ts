/* The library's JavaScript loads its own stylesheet (ADR-0021).

   Vite's library mode gathers every CSS import into one file beside the bundle
   and drops the imports from the JavaScript, which left a caller with a second
   line to write and an unstyled page when it was forgotten. This step puts the
   import back at the head of the entry chunk once both files are written.
   `sideEffects: ["**\/*.css"]` in the manifest keeps a caller's bundler from
   shaking it away again. */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

export function importOwnCss(entry: string, stylesheet: string): Plugin {
  return {
    name: "umriss-import-own-css",
    apply: "build",
    enforce: "post",
    writeBundle(options) {
      const dir = options.dir ?? "dist";
      const js = join(dir, entry);
      if (!existsSync(join(dir, stylesheet))) {
        throw new Error(`${stylesheet} was not written - nothing for ${entry} to import`);
      }
      const code = readFileSync(js, "utf8");
      const line = `import "./${stylesheet}";\n`;
      if (!code.startsWith(line)) writeFileSync(js, line + code);
    },
  };
}
