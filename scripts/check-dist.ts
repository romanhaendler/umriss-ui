/* The built package against ADR-0021, before anything is published:

   - every entry the manifest's `exports` names under `import` begins with
     `"use client";`,
   - the main entry imports its stylesheet as its second statement, right after,
   - the stylesheet begins with the layer order,
   - and holds no rule outside the layers, no selector beyond the library's
     own elements,
   - and an import of any entry that uses nothing leaves a residue under the
     budget (`residue.ts`).

   Run from a package directory: `node --experimental-strip-types
   ../../scripts/check-dist.ts <entry.js> <stylesheet.css>` - the packages call
   it in `prepublishOnly`, after the build. */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RESIDUE_BUDGET_BYTES, residueOf } from "./residue.ts";
import { beginsWithLayerOrder, offendersIn } from "./styles/rules.ts";

const [entry, stylesheet] = process.argv.slice(2);
if (!entry || !stylesheet) {
  console.error("usage: check-dist.ts <entry.js> <stylesheet.css>");
  process.exit(2);
}

const problems: string[] = [];
const exported = (value: unknown): string[] =>
  typeof value === "string" ? [value] : value && typeof value === "object" ? Object.values(value).flatMap(exported) : [];
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as { exports: Record<string, unknown> };
const entries = new Set(
  Object.values(manifest.exports).flatMap((target) => (target && typeof target === "object" && "import" in target ? exported(target.import) : [])),
);
for (const file of entries) {
  if (!readFileSync(file, "utf8").startsWith(`"use client";\n`)) problems.push(`${file} does not begin with "use client"`);
}

const js = readFileSync(join("dist", entry), "utf8");
if (!js.startsWith(`"use client";\nimport "./${stylesheet}";`)) problems.push(`dist/${entry} does not import ./${stylesheet} right after the directive`);

const css = readFileSync(join("dist", stylesheet), "utf8");
if (!beginsWithLayerOrder(css)) {
  problems.push(`dist/${stylesheet} does not begin with the layer order`);
}
for (const offender of offendersIn(css)) problems.push(`dist/${stylesheet}: ${offender}`);

/* An import that uses nothing must cost next to nothing. */
for (const file of entries) {
  const { gzipped, kept } = await residueOf(file);
  console.log(`${file}: residue ${gzipped} B gzipped (budget ${RESIDUE_BUDGET_BYTES} B)`);
  if (gzipped > RESIDUE_BUDGET_BYTES) {
    problems.push(
      `${file}: an import that uses nothing leaves ${gzipped} B gzipped, over ${RESIDUE_BUDGET_BYTES} B; kept top-level statements, largest first:\n` +
        kept.slice(0, 15).map((statement) => `  ${statement.bytes} B  ${statement.text.slice(0, 120)}`).join("\n"),
    );
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`dist/${entry} and dist/${stylesheet} follow ADR-0021; ${entries.size} entr${entries.size === 1 ? "y begins" : "ies begin"} with "use client"`);
