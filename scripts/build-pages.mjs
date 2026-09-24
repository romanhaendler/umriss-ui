/* The site on GitHub Pages: the three demos under one address, each in a
   directory of its own, and a page in front that points at them.

     site/index.html   the front page
     site/core/        the demo of @umriss-ui/core
     site/charts/      the demo of @umriss-ui/charts
     site/table/       the demo of @umriss-ui/table

   The demos are built with a relative base (`--base ./`), so the site runs
   under any path - https://<owner>.github.io/umriss-ui/ as well as a local
   `npx serve site`. That needs no router support from the host: the shell
   addresses its pages by the hash (packages/demo/src/Shell.tsx).

   The vite configs of the demos stay untouched: the screenshot suites build
   them with the default base, and nothing here should move a baseline.

   Beside each demo stand its text for coding agents (.scratch/ai-readable-docs):
   `llms.txt`, the index of its pages, and `llms-full.txt`, every page in full.
   Both are written by the demo's props run, which `build:demo` does first;
   `site/llms.txt` points at the five.

   Run: `pnpm build:pages`. */

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const PACKAGES = ["core", "charts", "table", "schedule", "calculation"];

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

const rows = [];
for (const dir of PACKAGES) {
  const manifest = JSON.parse(readFileSync(join(ROOT, "packages", dir, "package.json"), "utf8"));
  execFileSync("pnpm", ["--filter", manifest.name, "run", "build:demo", "--base", "./"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  cpSync(join(ROOT, "packages", dir, "dist-demo"), join(SITE, dir), { recursive: true });
  cpSync(join(ROOT, "packages", dir, "demo", ".generated", "llms.txt"), join(SITE, dir, "llms.txt"));
  cpSync(join(ROOT, "packages", dir, "docs", "llms-full.md"), join(SITE, dir, "llms-full.txt"));
  rows.push({ dir, name: manifest.name, version: manifest.version, description: manifest.description });
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

writeFileSync(
  join(SITE, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>umriss</title>
    <style>
      :root { color-scheme: light dark; --ink: #1b1d21; --muted: #5d636e; --paper: #f7f7f5; --card: #ffffff; --edge: #e3e3df; }
      @media (prefers-color-scheme: dark) { :root { --ink: #e8e9ec; --muted: #9aa0ab; --paper: #141518; --card: #1c1d21; --edge: #2c2e33; } }
      body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 system-ui, sans-serif; }
      main { max-width: 44rem; margin: 0 auto; padding: 4rem 1rem; }
      h1 { font-size: 1.6rem; font-weight: 600; margin: 0 0 .25rem; }
      p { color: var(--muted); margin: 0 0 2rem; }
      a.card { display: block; padding: 1rem 1.25rem; margin-bottom: .75rem; background: var(--card); border: 1px solid var(--edge); border-radius: 10px; color: inherit; text-decoration: none; }
      a.card:hover, a.card:focus-visible { border-color: var(--muted); }
      code { font: 600 .95rem ui-monospace, monospace; }
      .version { color: var(--muted); font: .85rem ui-monospace, monospace; margin-left: .5rem; }
      .card span.text { display: block; color: var(--muted); margin-top: .25rem; }
      footer { margin-top: 2rem; }
      footer a { color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <h1>umriss</h1>
      <p>React packages for data-dense applications. Each demo is the documentation of its package: running examples, their source, and the props generated from the code.</p>
${rows
  .map(
    (row) => `      <a class="card" href="./${row.dir}/"><code>${escape(row.name)}</code><span class="version">${escape(row.version)}</span><span class="text">${escape(row.description)}</span></a>`,
  )
  .join("\n")}
      <footer><a href="https://github.com/romanhaendler/umriss-ui">Source on GitHub</a> · <a href="./llms.txt">llms.txt</a>, for coding agents</footer>
    </main>
  </body>
</html>
`,
);

/* The workspace's index for an agent: which package is which, and where each
   one's own index and full text stand. Relative links, like the demos' base. */
writeFileSync(
  join(SITE, "llms.txt"),
  `# umriss

> React packages for the screens of a producing plant: components, canvas charts, a table, a schedule and calculations, in English and German. Each package's demo is its documentation; the text below points at the same material as plain text.

Every package carries the full text of its installed version as \`node_modules/<package>/docs/llms-full.md\`.

## Packages

${rows.map((row) => `- [${row.name}](./${row.dir}/llms.txt): ${row.description} Full text: [llms-full.txt](./${row.dir}/llms-full.txt)`).join("\n")}
`,
);

console.log(`\nsite/ is ready: ${rows.map((row) => `${row.dir}/`).join(", ")}, index.html and llms.txt`);
