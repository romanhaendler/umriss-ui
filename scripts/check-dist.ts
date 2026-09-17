/* The built package against ADR-0021, before anything is published:

   - the entry JavaScript imports its stylesheet as its first statement,
   - the stylesheet begins with the layer order,
   - and holds no rule outside the layers, no selector beyond the library's
     own elements.

   Run from a package directory: `node --experimental-strip-types
   ../../scripts/check-dist.ts <entry.js> <stylesheet.css>` - the packages call
   it in `prepublishOnly`, after the build. */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { offendersIn } from "./styles/rules.ts";

const [entry, stylesheet] = process.argv.slice(2);
if (!entry || !stylesheet) {
  console.error("usage: check-dist.ts <entry.js> <stylesheet.css>");
  process.exit(2);
}

const problems: string[] = [];
const js = readFileSync(join("dist", entry), "utf8");
if (!js.startsWith(`import "./${stylesheet}";`)) problems.push(`dist/${entry} does not import ./${stylesheet} first`);

const css = readFileSync(join("dist", stylesheet), "utf8");
if (!/^@layer\s+umriss\.tokens\s*,\s*umriss\.components\s*;/.test(css)) {
  problems.push(`dist/${stylesheet} does not begin with the layer order`);
}
for (const offender of offendersIn(css)) problems.push(`dist/${stylesheet}: ${offender}`);

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`dist/${entry} and dist/${stylesheet} follow ADR-0021`);
