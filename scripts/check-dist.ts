/* The built package against ADR-0021, before anything is published:

   - every entry the manifest's `exports` names under `import` begins with
     `"use client";`,
   - the main entry imports its stylesheet as its second statement, right after,
   - except where a package names a client file as a third argument: its main
     entry is then server-safe, so it must not begin with the directive and must
     import the client file, and the client file carries the directive and the
     stylesheet import,
   - the stylesheet begins with the layer order,
   - and holds no rule outside the layers, no selector beyond the library's
     own elements,
   - and a stylesheet with `light-dark()` survives Lightning CSS (the minifier
     of Vite 8 and Next 16, whose default targets lack it): the lowered tokens
     read only the switches `--lightningcss-light` and `--lightningcss-dark`,
     and `:root` in the tokens layer declares them to resolve to light,
   - and the entry holds the development-mode expression while no shipped
     JavaScript file holds `import.meta`,
   - and every `import` entry has an equal `default`, which Jest's CommonJS
     resolver reads,
   - and the packed package, installed into a scratch project, passes its
     consumer test (`tests-consumer/`) in a Vitest project and a Jest project
     that hold only the files the README's Testing section gives,
   - and a strict consumer compiles against the declarations of every entry,
     under `bundler` and `node10` resolution,
   - and where a package names a client file, a Server Component module written
     with the packed package renders through React's Flight server (the client
     file as a client reference), decodes through the Flight client and comes
     out as HTML (`scripts/flight/`); the same tree passed through a client
     component of the caller's fails with the package's own message,
   - and an import of any entry that uses nothing leaves a residue under the
     budget (`residue.ts`),
   - and the packed `docs/llms-full.md`, read without any site, names none,
   - and the changelog has a heading of the package's version, and every
     "Changed" entry under it a `Migration:` item,
   - and no `@deprecated` marker in `src/` is older than the package's own
     minor (ADR-0066).

   Run from a package directory: `node --experimental-strip-types
   ../../scripts/check-dist.ts <entry.js> <stylesheet.css> [client.js]` - the packages call
   it in `prepublishOnly`, after the build. */

import { spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { transform } from "lightningcss";
import { HOSTED_HOST, SITE } from "../packages/demo/src/address.ts";
import { RESIDUE_BUDGET_BYTES, residueOf } from "./residue.ts";
import { beginsWithLayerOrder, offendersIn } from "./styles/rules.ts";

const [entry, stylesheet, clientFile] = process.argv.slice(2);
if (!entry || !stylesheet) {
  console.error("usage: check-dist.ts <entry.js> <stylesheet.css> [client.js]");
  process.exit(2);
}

const problems: string[] = [];
const exported = (value: unknown): string[] =>
  typeof value === "string" ? [value] : value && typeof value === "object" ? Object.values(value).flatMap(exported) : [];
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as { exports: Record<string, unknown> };
const entries = new Set(
  Object.values(manifest.exports).flatMap((target) => (target && typeof target === "object" && "import" in target ? exported(target.import) : [])),
);
for (const [key, target] of Object.entries(manifest.exports)) {
  if (target && typeof target === "object" && "import" in target && (!("default" in target) || target.default !== target.import)) {
    problems.push(`exports["${key}"] has no "default" equal to its "import"; Jest does not find the entry`);
  }
}
for (const file of entries) {
  const begins = readFileSync(file, "utf8").startsWith(`"use client";\n`);
  if (clientFile && resolve(file) === resolve("dist", entry)) {
    if (begins) problems.push(`${file} begins with "use client"; its entry must run on a server`);
  } else if (!begins) problems.push(`${file} does not begin with "use client"`);
}

/* The documentation travels inside the package and is read without the site:
   an address of the site in it would lead nowhere. */
const documentation = readFileSync(join("docs", "llms-full.md"), "utf8");
if (documentation.includes(new URL(SITE).host) || documentation.includes(HOSTED_HOST)) problems.push("docs/llms-full.md names a site address");

const js = readFileSync(join("dist", entry), "utf8");
if (clientFile) {
  if (!js.includes(`from "./${clientFile}"`)) problems.push(`dist/${entry} does not import ./${clientFile}`);
  if (!readFileSync(join("dist", clientFile), "utf8").startsWith(`"use client";\nimport "./${stylesheet}";`)) {
    problems.push(`dist/${clientFile} does not import ./${stylesheet} right after the directive`);
  }
} else if (!js.startsWith(`"use client";\nimport "./${stylesheet}";`)) problems.push(`dist/${entry} does not import ./${stylesheet} right after the directive`);

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

/* A renamed name keeps its old form for one minor (ADR-0066): a marker names
   `since 0.<N>`, N is the package's minor or the next, so the release of the
   minor after N cannot go out while the old name stands. */
const version = (JSON.parse(readFileSync("package.json", "utf8")) as { version: string }).version;
const packageMinor = Number(/^0\.(\d+)\./.exec(version)?.[1]);
for (const file of readdirSync("src", { recursive: true, encoding: "utf8" }).filter((f) => /\.(tsx?|css)$/.test(f))) {
  readFileSync(join("src", file), "utf8").split("\n").forEach((line, index) => {
    if (!line.includes("@deprecated")) return;
    const minor = /@deprecated since 0\.(\d+)\b/.exec(line)?.[1];
    const at = `src/${file}:${index + 1}`;
    if (minor === undefined) problems.push(`${at}: @deprecated names no "since 0.<N>"`);
    else if (Number(minor) !== packageMinor && Number(minor) !== packageMinor + 1) {
      problems.push(`${at}: deprecated since 0.${minor}, the package is ${version}; remove it`);
    }
  });
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
const versionOf = (dir: string) => (JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { version: string }).version;
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
  /* The floor's compiler (TypeScript 5.4, the root's `typescript-floor`) compiles the same files: a
     declaration that needs a newer one fails there. It lacks `noUncheckedSideEffectImports` (from 5.6)
     and keeps every other option; `skipLibCheck` stays off, or an unknown `NoInfer` would pass. */
  const compilers = [
    ["TypeScript " + versionOf(resolve("node_modules", "typescript")), resolve("node_modules", "typescript", "bin", "tsc"), true],
    ["TypeScript " + versionOf(resolve("../../node_modules", "typescript-floor")), resolve("../../node_modules", "typescript-floor", "bin", "tsc"), false],
  ] as const;
  for (const [compiler, tsc, sideEffectImports] of compilers) for (const [moduleName, resolution] of [["ESNext", "bundler"], ["CommonJS", "node10"]]) {
    writeFileSync(
      join(consumerRoot, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          strict: true, exactOptionalPropertyTypes: true, skipLibCheck: false, declaration: true, noEmit: false, emitDeclarationOnly: true,
          outDir: "out", ...(sideEffectImports ? { noUncheckedSideEffectImports: true } : {}), module: moduleName, moduleResolution: resolution, target: "ES2022", jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"], types: [],
        },
        files: ["consumer.ts"],
      }),
    );
    const compiled = spawnSync(process.execPath, [tsc, "-p", "."], { cwd: consumerRoot, encoding: "utf8" });
    if (compiled.status !== 0) problems.push(`a strict consumer does not compile under ${compiler} with ${resolution} resolution:\n${compiled.stdout}${compiled.stderr}`);
    else console.log(`a strict consumer compiles under ${compiler} with ${resolution} resolution`);
  }
  if (clientFile) flightCheck(consumerRoot);
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}

/* The installed package under the test runners. The package and its umriss
   dependencies are unpacked from their tarballs into the scratch project's
   `node_modules`: a symlink would resolve to a path outside it, Vitest would
   inline the package by itself, and the check would pass without the line the
   README gives. The configuration and setup files are the README's fenced
   blocks, taken by the file name in their info string; only the consumer test
   is written besides. */
const SCOPE = "@umriss-ui/";
/* Core's lines serve core and the packages that draw with it; charts must work without core and
   gives its own in full; schedule draws with both, so it takes both, and a file both name (the
   setup file) is the two blocks one after the other, as its README says. */
const readmes = (name === "@umriss-ui/charts" ? ["."] : name === "@umriss-ui/schedule" ? ["../core", "../charts"] : ["../core"]).map((dir) => join(dir, "README.md"));
const runnerRoot = mkdtempSync(join(tmpdir(), "check-dist-runners-"));
try {
  const tarballs = join(runnerRoot, "tarballs");
  mkdirSync(tarballs);
  const unpacked = new Set<string>();
  const install = (directory: string, packageName: string) => {
    if (unpacked.has(packageName)) return;
    unpacked.add(packageName);
    const packed = spawnSync("npm", ["pack", "--ignore-scripts", "--silent", "--pack-destination", tarballs], { cwd: directory, encoding: "utf8" });
    if (packed.status !== 0) throw new Error(`npm pack failed in ${directory}:\n${packed.stderr}`);
    const target = join(runnerRoot, "node_modules", packageName);
    mkdirSync(target, { recursive: true });
    const tarball = join(tarballs, packed.stdout.trim().split("\n").pop()!);
    const untar = spawnSync("tar", ["-xzf", tarball, "-C", target, "--strip-components=1"], { encoding: "utf8" });
    if (untar.status !== 0) throw new Error(`tar failed for ${packageName}:\n${untar.stderr}`);
    const own = JSON.parse(readFileSync(join(directory, "package.json"), "utf8")) as { dependencies?: object; peerDependencies?: object };
    for (const dependency of Object.keys({ ...own.dependencies, ...own.peerDependencies })) {
      if (dependency.startsWith(SCOPE)) install(join("..", dependency.slice(SCOPE.length)), dependency);
    }
  };
  install(".", name);

  /* The tools and the libraries a test imports come from the workspace; React
     and React DOM are the package's own, so that there is one copy of each. */
  for (const tool of ["vitest", "jest", "jest-environment-jsdom", "@babel", "@testing-library"]) {
    mkdirSync(dirname(join(runnerRoot, "node_modules", tool)), { recursive: true });
    symlinkSync(resolve("..", "..", "node_modules", tool), join(runnerRoot, "node_modules", tool));
  }
  for (const react of ["react", "react-dom"]) symlinkSync(resolve("node_modules", react), join(runnerRoot, "node_modules", react));

  const written = new Set<string>();
  for (const readme of readmes) {
    for (const block of readFileSync(readme, "utf8").matchAll(/^```\S+ (\S+)\n([\s\S]*?)^```$/gm)) {
      const file = join(runnerRoot, block[1]!);
      /* Configuration files are identical in both READMEs; only the setup file differs and is appended. */
      if (written.has(file) && block[1] !== "umriss.setup.js") continue;
      (written.has(file) ? appendFileSync : writeFileSync)(file, block[2]!);
      written.add(file);
    }
  }
  copyFileSync(join("tests-consumer", `${name.slice(SCOPE.length)}.test.jsx`), join(runnerRoot, "consumer.test.jsx"));

  const runners: [string, string[]][] = [
    ["Vitest", [resolve("..", "..", "node_modules", "vitest", "vitest.mjs"), "run"]],
    ["Jest", [resolve("..", "..", "node_modules", "jest", "bin", "jest.js")]],
  ];
  for (const [runner, args] of runners) {
    const run = spawnSync(process.execPath, args, { cwd: runnerRoot, encoding: "utf8", env: { ...process.env, CI: "1" } });
    if (run.status !== 0) problems.push(`the consumer test fails under ${runner} with the README's files:\n${run.stdout}${run.stderr}`);
  }
} finally {
  rmSync(runnerRoot, { recursive: true, force: true });
}

/* The public packages release in step under one number, and each umriss peer is
   written `workspace:^0.<minor>.0` of that number (pnpm packs `^0.<minor>.0`),
   so a patch of the same minor is accepted and a minor release has to move it. */
{
  const own = JSON.parse(readFileSync("package.json", "utf8")) as { version: string; peerDependencies?: Record<string, string> };
  const versions = readdirSync("..").flatMap((dir) => {
    try {
      const other = JSON.parse(readFileSync(join("..", dir, "package.json"), "utf8")) as { name: string; version: string; private?: boolean };
      return other.private ? [] : [`${other.name} ${other.version}`];
    } catch {
      return [];
    }
  });
  if (new Set(versions.map((line) => line.split(" ")[1])).size > 1) {
    problems.push(`the public packages carry more than one version:\n${versions.map((line) => `  ${line}`).join("\n")}`);
  }
  const expected = `workspace:^0.${own.version.split(".")[1]}.0`;
  for (const [peer, range] of Object.entries(own.peerDependencies ?? {})) {
    if (peer.startsWith("@umriss-ui/") && range !== expected) problems.push(`peer ${peer} reads ${range}, expected ${expected}`);
  }
}

/* The changelog's section of this version has its heading, and every top-level
   entry under its `### Changed` carries a nested `Migration:` item with text
   after it. Earlier sections predate the rule. */
{
  const version = (JSON.parse(readFileSync("package.json", "utf8")) as { version: string }).version;
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const start = changelog.indexOf(`\n## ${version} \u2013 `);
  if (start < 0) problems.push(`CHANGELOG.md: no heading for ${version}`);
  else {
    const section = changelog.slice(start + 1).split(/\n## /)[0];
    const changed = /\n### Changed\n([\s\S]*?)(?=\n### |$)/.exec(section)?.[1] ?? "";
    for (const entry of changed.split(/\n(?=- )/).filter((text) => text.startsWith("- "))) {
      if (!/^ {2}- Migration: *\S/m.test(entry)) problems.push(`CHANGELOG.md ${version}: the entry ${/\*\*[^*]+\*\*/.exec(entry)?.[0] ?? entry.slice(0, 60)} has no "Migration:" item`);
    }
  }
}

/* A calculation written in a Server Component, rendered the way React's Flight
   renderer does (`scripts/flight/`): the server half runs under the
   `react-server` condition with the client file as a client reference, the
   client half decodes its payload against the built client file. */
function flightCheck(root: string) {
  const here = resolve("../../scripts/flight");
  for (const file of readdirSync(here)) copyFileSync(join(here, file), join(root, file));
  writeFileSync(join(root, "register.mjs"), `import { register } from "node:module";\nregister("./loader.mjs", import.meta.url);\n`);
  symlinkSync(resolve("node_modules", "react-dom"), join(root, "node_modules", "react-dom"));
  symlinkSync(resolve("../../node_modules", "react-server-dom-webpack"), join(root, "node_modules", "react-server-dom-webpack"));
  const run = (args: string[], input?: Buffer) =>
    spawnSync(process.execPath, args, { cwd: root, input, env: { ...process.env, NODE_ENV: "development" }, maxBuffer: 1 << 26 });
  const render = (page: string) => {
    const payload = run(["--conditions", "react-server", "--import", "./register.mjs", "server.mjs", page]);
    if (payload.status !== 0) return { html: "", error: `the Flight server failed:\n${payload.stderr}` };
    const html = run(["--import", "./register.mjs", "client.mjs", resolve("dist", clientFile), join(root, "passthrough.client.js")], payload.stdout);
    return { html: String(html.stdout), error: String(html.stderr) };
  };
  const costing = render("costing");
  const missing = ["Costing", "Direct material", "Material cost", "Production cost", "Net offer price", "1,840"].filter((text) => !costing.html.includes(text));
  if (costing.error || missing.length > 0) {
    problems.push(`a calculation written in a Server Component does not render through Flight${costing.error ? `:\n${costing.error}` : ""}${missing.length > 0 ? `\nits HTML lacks: ${missing.join(", ")}` : ""}`);
  }
  const passed = render("passed");
  if (!passed.error.includes("stands only directly inside a <Calculation>")) {
    problems.push(`a tree passed through a client component does not fail with the calculation's error; it gave:\n${passed.error || passed.html.slice(0, 300)}`);
  }
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
console.log(
  clientFile
    ? `dist/${entry} runs on a server and dist/${clientFile} follows ADR-0021; a calculation written in a Server Component renders through Flight`
    : `dist/${entry} and dist/${stylesheet} follow ADR-0021; ${entries.size} entr${entries.size === 1 ? "y begins" : "ies begin"} with "use client"`,
);
