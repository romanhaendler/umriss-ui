/* Every entry of the library is a client component ("use client").

   The components keep state and read the DOM, so a caller's Server Component
   that imports one without the directive fails with a message about the
   caller's file. Vite drops a module-level directive from a bundled entry, and
   `banner` would put it on the shared chunks too - so this step writes it onto
   the entry chunks once the files are written.

   It runs after `importOwnCss`, which has put the stylesheet import at the head:
   the directive goes in front of it, because only the first statement of a
   module counts. */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

export function clientDirective(): Plugin {
  return {
    name: "umriss-use-client",
    apply: "build",
    enforce: "post",
    writeBundle(options, bundle) {
      const dir = options.dir ?? "dist";
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk" || !chunk.isEntry) continue;
        const file = join(dir, chunk.fileName);
        const code = readFileSync(file, "utf8");
        const line = `"use client";\n`;
        if (!code.startsWith(line)) writeFileSync(file, line + code);
      }
    },
  };
}
