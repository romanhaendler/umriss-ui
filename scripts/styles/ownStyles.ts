/* What every build of the library shares - the three library builds, the three
   demo builds and the unit tests alike, because the demos and the tests run the
   sources and have to run what ships (ADR-0021):

   - `box-sizing` and squircle corners on the library's own elements, and only
     there (`ownBox`, `ownCorners`);
   - `#own-styles`, the classes every component composes its text context, focus
     ring, caret and scrollbars from (`own.module.css` beside this file). */

import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { foldOwnCopies } from "./fold.ts";
import { ownBox, ownCorners } from "./ownBox.ts";

export function ownStyles(): Plugin {
  return {
    name: "umriss-own-styles",
    /* The copies of `#own-styles` are folded into one in every build
       (`fold.ts` says why that moves no picture). */
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === "asset" && file.fileName.endsWith(".css") && typeof file.source === "string") {
            file.source = foldOwnCopies(file.source);
          }
        }
      },
    },
    config: () => ({
      css: { postcss: { plugins: [ownBox(), ownCorners()] } },
      resolve: {
        alias: [{ find: /^#own-styles$/, replacement: fileURLToPath(new URL("./own.module.css", import.meta.url)) }],
      },
    }),
  };
}
