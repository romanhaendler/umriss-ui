/* This demo's gate: `pnpm --filter @umriss-ui/core props`.

   The gate itself stands in `@umriss-ui/demo`; what comes in here is only what
   makes this demo this one - its package, its outline, the Language page's
   wording tables (`tooling/languageTables.ts`) and the Theming page's token
   table, read from the stylesheet that declares the tokens.

   The `outline` key is the shell's field name. What is still German behind it
   is `propsReader.ts`'s own field names, which english-and-umriss-ui 05 recorded
   as its one open deviation. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateLlms } from "@umriss-ui/demo/tooling/llms";
import { generateProps } from "@umriss-ui/demo/tooling/props";
import { readTokens } from "@umriss-ui/demo/tooling/tokens";
import { missingTokens, tokenTable } from "@umriss-ui/demo/tooling/tokenTable";
import { OUTLINE } from "./outline.ts";
import { languageTables, missingAnchors } from "./tooling/languageTables.ts";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = readFileSync(join(packageDir, "src", "styles", "tokens.css"), "utf8");
/* The text for coding agents comes from the same tables, right after them:
   `llms.txt` beside the demo, `docs/llms-full.md` into the npm package
   (.scratch/ai-readable-docs). */
const pages = generateLlms({
  packageDir,
  outline: OUTLINE,
  tables: generateProps({ packageName: packageDir, outline: OUTLINE }),
  references: { theming: [tokenTable(readTokens(tokensCss))], language: languageTables(packageDir) },
});

/* The page as the site writes it carries a row for every key the running
   objects have (theming-and-wording-reference 04). */
const missing = missingAnchors(pages.find((page) => page.path === "language/")?.html ?? "");
if (missing.length > 0) {
  process.stderr.write(`The Language page has no row for ${missing.length} wording key${missing.length === 1 ? "" : "s"}:\n${missing.map((id) => `  #${id}`).join("\n")}\n`);
  process.exit(1);
}

/* And one for every token the stylesheet declares, counted on its text
   (theming-and-wording-reference 01). */
const lost = missingTokens(tokensCss, pages.find((page) => page.path === "theming/")?.html ?? "");
if (lost.length > 0) {
  process.stderr.write(`The Theming page has no row for ${lost.length} token${lost.length === 1 ? "" : "s"}:\n${lost.map((name) => `  ${name}`).join("\n")}\n`);
  process.exit(1);
}
