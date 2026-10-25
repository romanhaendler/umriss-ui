/* The built package against ADR-0021, before anything is published:

   - every entry the manifest's `exports` names under `import` begins with
     `"use client";`,
   - the main entry imports its stylesheet as its second statement, right after,
   - the stylesheet begins with the layer order,
   - and holds no rule outside the layers, no selector beyond the library's
     own elements,
   - and a stylesheet with `light-dark()` survives Lightning CSS (the minifier
     of Vite 8 and Next 16, whose default targets lack it): the lowered tokens
     read only the switches `--lightningcss-light` and `--lightningcss-dark`,
     and `:root` in the tokens layer declares them to resolve to light,
   - and the entry holds the development-mode expression while no shipped
     JavaScript file holds `import.meta`,
   - and a strict consumer compiles against the declarations of every entry,
     under `bundler` and `node10` resolution,
   - and an import of any entry that uses nothing leaves a residue under the
     budget (`residue.ts`),
   - and the packed `docs/llms-full.md`, read without any site, names none.

   Run from a package directory: `node --experimental-strip-types
   ../../scripts/check-dist.ts <entry.js> <stylesheet.css>` - the packages call
   it in `prepublishOnly`, after the build. */

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { transform } from "lightningcss";
import { HOSTED_HOST, SITE } from "../packages/demo/src/address.ts";
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

/* The documentation travels inside the package and is read without the site:
   an address of the site in it would lead nowhere. */
const documentation = readFileSync(join("docs", "llms-full.md"), "utf8");
if (documentation.includes(new URL(SITE).host) || documentation.includes(HOSTED_HOST)) problems.push("docs/llms-full.md names a site address");

const js = readFileSync(join("dist", entry), "utf8");
if (!js.startsWith(`"use client";\nimport "./${stylesheet}";`)) problems.push(`dist/${entry} does not import ./${stylesheet} right after the directive`);

/* Development mode is one literal expression every toolchain reads (Vite's dev
   server, Node, Jest): a package whose source asks it must still ask it in the
   build, or its warnings were compiled out. `import.meta` in a shipped file
   stops Jest from loading it at all. */
const DEV_EXPRESSION = `process.env.NODE_ENV !== "production"`;
const sources = readdirSync("src", { recursive: true, encoding: "utf8" })
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => [file, readFileSync(join("src", file), "utf8")] as const);
/* The library build replaces `import.meta.env.*` and would compile a warning
   out without a trace in the build, so the source must not ask it either. */
for (const [file, text] of sources) if (text.includes("import.meta")) problems.push(`src/${file} reads import.meta; ask ${DEV_EXPRESSION} instead`);
if (sources.some(([, text]) => text.includes(DEV_EXPRESSION)) && !js.includes(DEV_EXPRESSION)) {
  problems.push(`dist/${entry} does not contain the development-mode expression ${DEV_EXPRESSION}`);
}
for (const file of readdirSync("dist", { recursive: true, encoding: "utf8" })) {
  if (file.endsWith(".js") && readFileSync(join("dist", file), "utf8").includes("import.meta")) problems.push(`dist/${file} contains import.meta`);
}

const css = readFileSync(join("dist", stylesheet), "utf8");
if (!beginsWithLayerOrder(css)) {
  problems.push(`dist/${stylesheet} does not begin with the layer order`);
}
for (const offender of offendersIn(css)) problems.push(`dist/${stylesheet}: ${offender}`);

/* The targets are Vite's default (chrome 107, edge 107, firefox 104, safari 16), as `major << 16`. */
if (css.includes("light-dark(")) {
  const lowered = transform({
    filename: stylesheet,
    code: Buffer.from(css),
    targets: { chrome: 107 << 16, edge: 107 << 16, firefox: 104 << 16, safari: 16 << 16 },
  }).code.toString();
  const names = new Set([...lowered.matchAll(/--lightningcss-([\w-]+)/g)].map((match) => match[1]));
  for (const name of names) if (name !== "light" && name !== "dark") problems.push(`dist/${stylesheet}: lowered, it reads --lightningcss-${name}, which nothing declares`);
  const root = /@layer umriss\.tokens\s*\{\s*:root\s*\{([^}]*)\}/.exec(lowered)?.[1] ?? "";
  if (!/--lightningcss-light:\s*initial\s*;/.test(root) || !/--lightningcss-dark:\s*;/.test(root)) {
    problems.push(`dist/${stylesheet}: lowered for Lightning CSS, :root in @layer umriss.tokens does not declare --lightningcss-light: initial and --lightningcss-dark: (empty)`);
  }
}

/* A strict consumer - the strictest settings a library's callers use, and
   `declaration: true` as a wrapper library has it - imports every entry,
   the stylesheet included, and re-exports what a hook returns. A type the
   declarations leave unexported (TS4058), an optional property that rejects
   `undefined`, or a subpath without a declaration shows here. `node10` finds
   the subpaths only through `typesVersions`, and ignores `exports`. */
const name = (JSON.parse(readFileSync("package.json", "utf8")) as { name: string }).name;
const subpaths = Object.keys(manifest.exports).map((key) => name + key.slice(1));
const CONSUMER_HOOKS: Record<string, string[]> = {
  "@umriss-ui/core": ["export const toast = () => e0.useToast();", "export const field = () => e0.useFormField();"],
};
const consumerRoot = mkdtempSync(join(tmpdir(), "check-dist-"));
try {
  mkdirSync(join(consumerRoot, "node_modules", "@umriss-ui"), { recursive: true });
  symlinkSync(resolve("."), join(consumerRoot, "node_modules", name));
  symlinkSync(resolve("node_modules", "@types"), join(consumerRoot, "node_modules", "@types"));
  symlinkSync(resolve("node_modules", "react"), join(consumerRoot, "node_modules", "react"));
  const code = [
    ...subpaths.map((path, index) => (path.endsWith(".css") ? `import "${path}";` : `import * as e${index} from "${path}";`)),
    ...(CONSUMER_HOOKS[name] ?? []),
    `export const entries = { ${subpaths.flatMap((path, index) => (path.endsWith(".css") ? [] : [`e${index}`])).join(", ")} };`,
  ].join("\n");
  writeFileSync(join(consumerRoot, "consumer.ts"), code);
  for (const [moduleName, resolution] of [["ESNext", "bundler"], ["CommonJS", "node10"]]) {
    writeFileSync(
      join(consumerRoot, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          strict: true, exactOptionalPropertyTypes: true, skipLibCheck: false, declaration: true, noEmit: false, emitDeclarationOnly: true,
          outDir: "out", noUncheckedSideEffectImports: true, module: moduleName, moduleResolution: resolution, target: "ES2022", jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"], types: [],
        },
        files: ["consumer.ts"],
      }),
    );
    const compiled = spawnSync(process.execPath, [resolve("node_modules", "typescript", "bin", "tsc"), "-p", "."], { cwd: consumerRoot, encoding: "utf8" });
    if (compiled.status !== 0) problems.push(`a strict consumer does not compile under ${resolution} resolution:\n${compiled.stdout}${compiled.stderr}`);
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}

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
