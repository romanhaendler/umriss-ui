/* What an import of a built entry leaves behind when nothing is used from it:
   a stub that imports the entry for its side effects only is bundled with
   Rollup, minified with esbuild and gzipped. Stylesheets resolve to nothing and
   every bare specifier (the peers) stays external, so what remains is code no
   bundler can prove unused - above all a top-level call that is not marked
   pure.

   Rollup and esbuild come through Vite, which every package has; the lookup
   starts at the working directory, a package's own. */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

export const RESIDUE_BUDGET_BYTES = 1500;

export type Kept = { bytes: number; text: string };

const isExternal = (id: string) => !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("\0");

export async function residueOf(entry: string): Promise<{ gzipped: number; kept: Kept[] }> {
  const fromVite = createRequire(createRequire(join(process.cwd(), "package.json")).resolve("vite"));
  /* Typed by hand: the scripts' own tsconfig resolves neither package. */
  const { rollup } = (await import(fromVite.resolve("rollup"))) as {
    rollup: (options: object) => Promise<{ generate: (options: object) => Promise<{ output: { code?: string }[] }> }>;
  };
  const { parseAst } = (await import(fromVite.resolve("rollup/parseAst"))) as {
    parseAst: (code: string) => { body: { type: string; start: number; end: number }[] };
  };
  const esbuild = fromVite("esbuild") as { transform: (code: string, options: object) => Promise<{ code: string }> };

  const dir = mkdtempSync(join(tmpdir(), "residue-"));
  try {
    const stub = join(dir, "stub.js");
    writeFileSync(stub, `import ${JSON.stringify(resolve(entry))};\n`);
    const bundle = await rollup({
      input: stub,
      external: isExternal,
      onwarn() {},
      plugins: [
        {
          name: "stylesheets-resolve-to-nothing",
          resolveId: (id: string) => (id.endsWith(".css") ? { id: "\0css", moduleSideEffects: false } : null),
          load: (id: string) => (id === "\0css" ? "" : null),
        },
      ],
    });
    const { output } = await bundle.generate({ format: "es" });
    const code = output.map((chunk) => chunk.code ?? "").join("\n");
    const minified = await esbuild.transform(code, { minify: true, format: "esm" });
    const kept = parseAst(code)
      .body.filter((node) => node.type !== "ImportDeclaration")
      .map((node): Kept => ({ bytes: node.end - node.start, text: code.slice(node.start, node.end).replace(/\s+/g, " ") }))
      .sort((a, b) => b.bytes - a.bytes);
    return { gzipped: gzipSync(minified.code, { level: 9 }).length, kept };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
