/* The demo as text for a coding agent: `llms.txt` and `llms-full.txt`
   (.scratch/ai-readable-docs, A1).

   Nothing here is written twice. The pages come from the outline, the tables
   from the same `props.json` the demo renders, the examples from the same files
   through the same string function (`displaySource`), the
   scenarios from theirs. So the text an agent reads is
   the demo a person reads, one medium over - and it cannot drift from it
   without the demo drifting too.

   Two files, as llmstxt.org proposes. `llms.txt` is the index: the package, its
   pages with one line and a link each. `llms-full.txt` is every page in full.
   The full text also travels inside the npm package as `docs/llms-full.md`, so
   that an agent reads the documentation of the version that is installed and
   not of whatever the site shows today.

   It runs in Node (`demo/props.ts`, after the props tables), which is why the
   imports carry their extensions and nothing here touches Vite or React. */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import type { Rubric, Page } from "../outline.ts";
import { byRank, parseFileName, parseScenarioName } from "./fileName.ts";
import { displaySource, worldsOf } from "./source.ts";

/** The demos' shared data, beside this file. */
const WORLDS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "worlds");
import type { TypeEntry } from "./propsReader.ts";

export interface LlmsJob {
  /** The package's directory: `package.json` and `demo/` are read there. */
  packageDir: string;
  /** Where the worlds are read from - the shell's own by default. */
  worldsDir?: string;
  outline: readonly Rubric[];
  /** The generated props tables - what `generateProps` just wrote. */
  tables: Readonly<Record<string, TypeEntry>>;
}

interface Manifest {
  name: string;
  version: string;
  description: string;
  homepage: string;
}

interface ExampleText {
  pageId: string;
  id: string;
  rank: number;
  title: string;
  lead?: string;
  source: string;
  /** The worlds it imports, as `operations`. */
  worlds: readonly string[];
}

interface ScenarioText {
  id: string;
  rank: number;
  title: string;
  lead: string;
  callouts: readonly string[];
  /** Page ids of this demo, or `{ name, page }` of a neighbour. */
  builtFrom: readonly (string | { name: string; page: string })[];
  source: string;
  worlds: readonly string[];
}

/* ------------------------------------------------------------------ */
/* Markdown pieces                                                     */
/* ------------------------------------------------------------------ */

/** A fence longer than any run of backticks inside - a source may hold one. */
function fenced(language: string, text: string): string {
  const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(longest + 1);
  return `${fence}${language}\n${text.replace(/\n+$/, "")}\n${fence}`;
}

/** Inline code that survives a backtick in the text (a template literal type). */
function code(text: string): string {
  if (!text.includes("`")) return `\`${text}\``;
  return `\`\` ${text} \`\``;
}

/** One table cell: one line, and a pipe that does not end the cell. */
function cell(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|");
}

/* ------------------------------------------------------------------ */
/* Reading the demo from disk                                          */
/* ------------------------------------------------------------------ */

/* What `readExamples` takes from the running module, read from the text
   instead: every title and lead is one line in the workspace, and a
   form this does not read throws rather than being guessed at. The scenarios'
   lists are read by the compiler. */
const TITLE = /^export const title = ("(?:[^"\\]|\\.)*");$/m;
const LEAD = /^export const lead =\s*("(?:[^"\\]|\\.)*");$/m;

function titleOf(path: string, raw: string): string {
  const title = TITLE.exec(raw);
  if (title === null) throw new Error(`\`${path}\` has no \`export const title = "…";\` on one line.`);
  return JSON.parse(title[1]!) as string;
}

function leadOf(raw: string): string | undefined {
  const lead = LEAD.exec(raw);
  return lead === null ? undefined : (JSON.parse(lead[1]!) as string);
}

/** An exported literal - strings, arrays, objects - read by the compiler
    rather than by a pattern: a callout may well hold a comma and a colon. */
function literalOf(path: string, name: string, raw: string): unknown {
  const file = ts.createSourceFile(path, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const value = (node: ts.Expression): unknown => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return value(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(value);
    if (ts.isObjectLiteralExpression(node)) {
      return Object.fromEntries(
        node.properties.map((property) => {
          if (!ts.isPropertyAssignment(property)) throw new Error(`\`${path}\`'s \`${name}\` holds \`${property.getText()}\`, which is no literal.`);
          return [property.name.getText().replace(/^["']|["']$/g, ""), value(property.initializer)];
        }),
      );
    }
    throw new Error(`\`${path}\`'s \`${name}\` holds \`${node.getText()}\`, which is no literal.`);
  };
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const one of statement.declarationList.declarations) {
      if (ts.isIdentifier(one.name) && one.name.text === name && one.initializer !== undefined) return value(one.initializer);
    }
  }
  return undefined;
}

function readExample(demoDir: string, file: string, packageName: string): ExampleText {
  const path = `./examples/${file}`;
  const raw = readFileSync(join(demoDir, "examples", file), "utf8");
  const { pageId, id, rank } = parseFileName(path);
  const lead = leadOf(raw);
  return {
    pageId,
    id,
    rank,
    title: titleOf(path, raw),
    ...(lead === undefined ? {} : { lead }),
    source: displaySource(raw, packageName),
    worlds: worldsOf(raw),
  };
}

function readScenario(demoDir: string, file: string, packageName: string): ScenarioText {
  const path = `./scenarios/${file}`;
  const raw = readFileSync(join(demoDir, "scenarios", file), "utf8");
  const { id, rank } = parseScenarioName(path);
  return {
    id,
    rank,
    title: titleOf(path, raw),
    lead: leadOf(raw) ?? "",
    callouts: (literalOf(path, "callouts", raw) ?? []) as string[],
    builtFrom: (literalOf(path, "builtFrom", raw) ?? []) as ScenarioText["builtFrom"],
    source: displaySource(raw, packageName),
    worlds: worldsOf(raw),
  };
}

function listScenarios(demoDir: string): string[] {
  const root = join(demoDir, "scenarios");
  return existsSync(root) ? readdirSync(root).filter((name) => name.endsWith(".tsx")) : [];
}

function listExamples(demoDir: string): string[] {
  const root = join(demoDir, "examples");
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((folder) =>
      readdirSync(join(root, folder.name))
        .filter((name) => name.endsWith(".tsx"))
        .map((name) => `${folder.name}/${name}`),
    );
}

/* ------------------------------------------------------------------ */
/* What the package exports beyond its pages                           */
/* ------------------------------------------------------------------ */

export interface ExportedDeclaration {
  /** The name a caller imports. */
  name: string;
  /** The declaration as its `.d.ts` shows it - no body, the JSDoc kept. */
  text: string;
}

/** Every export of `src/index.ts`, in the order the entry names them, with its
    declaration as the compiler emits it for a `.d.ts`.

    The pages name what a reader looks up; the pure modules and the types the
    components are made of are exported too, and an agent that never reads
    their signature guesses it. The declaration emit is the one form that is
    exact without being the implementation: bodies gone, comments kept, and
    the same text the npm package's `dist/index.d.ts` carries. */
export function exportedDeclarations(packageDir: string): ExportedDeclaration[] {
  const entry = join(packageDir, "src", "index.ts");
  const configPath = join(packageDir, "tsconfig.json");
  /* The package's own options where it has them - the paths to its
     neighbours' source above all, so that a type from core reads as it is
     written and not as `any` from a dist that was never built. */
  const parsed = existsSync(configPath)
    ? ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })
    : undefined;
  const options: ts.CompilerOptions = {
    ...(parsed?.options ?? { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022, strict: true, skipLibCheck: true }),
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    removeComments: false,
  };
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!);
  if (module === undefined) throw new Error(`\`${entry}\` is not a module the compiler can read.`);

  const emitted = new Map<string, ts.SourceFile>();
  const declarationsOf = (file: ts.SourceFile): ts.SourceFile => {
    const known = emitted.get(file.fileName);
    if (known !== undefined) return known;
    let text = "";
    program.emit(file, (name, data) => {
      if (name.endsWith(".d.ts")) text = data;
    }, undefined, true);
    const parsedFile = ts.createSourceFile(`${file.fileName}.d.ts`, text, ts.ScriptTarget.Latest, true);
    emitted.set(file.fileName, parsedFile);
    return parsedFile;
  };

  return checker.getExportsOfModule(module).map((exported) => {
    const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = target.declarations?.[0];
    if (declaration === undefined) return { name: exported.name, text: "" };
    const emittedFile = declarationsOf(declaration.getSourceFile());
    /* A symbol may have several statements (an overloaded function, an
       interface merged with a const); all of them belong to its signature. */
    const statements = emittedFile.statements.filter((statement) => declares(statement, target.name));
    /* The keywords come off the statement, never off its comment - a JSDoc
       line may well begin with "export" or say "declare". */
    const text = statements
      .map((statement) => {
        const comment = statement.getFullText().slice(0, statement.getStart() - statement.getFullStart()).trim();
        const body = statement.getText().replace(/^export /, "").replace(/^declare /, "");
        return comment === "" ? body : `${comment}\n${body}`;
      })
      .join("\n");
    return { name: exported.name, text: target.name === exported.name ? text : `${text}\n// exported as ${exported.name}` };
  });
}

function declares(statement: ts.Statement, name: string): boolean {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.some((one) => ts.isIdentifier(one.name) && one.name.text === name);
  }
  const named = statement as ts.Statement & { name?: ts.Node };
  return named.name !== undefined && ts.isIdentifier(named.name) && named.name.text === name;
}

/** The names a text never mentions as code - the completeness guard's
    question, and the appendix's.

    Only code counts: fenced blocks and inline spans, where a page's import
    line, its tables, its examples and its texts' backticks stand. An export
    called `format` is not named by the English word in a sentence. */
export function missingFrom(text: string, names: readonly string[]): string[] {
  const codeOnly = (text.match(/^(`{3,})[^\n]*\n[\s\S]*?^\1$|`[^`\n]+`|``[^\n]+?``/gm) ?? []).join("\n");
  return names.filter((name) => !new RegExp(`(^|[^\\w$])${name.replace(/\$/g, "\\$")}($|[^\\w$])`).test(codeOnly));
}

/* ------------------------------------------------------------------ */
/* The two texts                                                       */
/* ------------------------------------------------------------------ */

function pageUrl(manifest: Manifest, page: Page): string {
  return `${manifest.homepage}#/${page.id}`;
}

function tableMarkdown(entry: TypeEntry): string {
  const parameter = entry.parameter.length === 0 ? "" : `<${entry.parameter.join(", ")}>`;
  const lines = [`##### ${code(entry.name + parameter)}`, ""];
  if (entry.props.length === 0) lines.push("Declares no props of its own.");
  else {
    lines.push("| Prop | Type | Default | Description |", "|---|---|---|---|");
    for (const prop of entry.props) {
      const name = `${code(prop.name)}${prop.optional ? "" : " (required)"}`;
      const origin = prop.inheritedFrom === undefined ? "" : ` From ${code(prop.inheritedFrom)}.`;
      lines.push(
        `| ${name} | ${cell(code(prop.type))} | ${prop.defaultValue === undefined ? "—" : cell(code(prop.defaultValue))} | ${cell(prop.description + origin)} |`,
      );
    }
  }
  const also = entry.alsoTakes ?? [];
  if (also.length > 0) lines.push("", `Also every prop of ${also.map(code).join(", ")}.`);
  if (entry.inherits !== undefined) {
    const without = entry.omitted.length === 0 ? "" : ` – without ${entry.omitted.map(code).join(", ")}`;
    lines.push("", `Also takes every attribute of ${entry.inherits.startsWith("<") ? code(entry.inherits) : entry.inherits}${without}.`);
  }
  return lines.join("\n");
}

/** Both texts of one package, from its directory. Pure apart from reading. */
export function renderLlms({ packageDir, outline, tables, worldsDir = WORLDS_DIR }: LlmsJob): { index: string; full: string } {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as Manifest;
  const demoDir = join(packageDir, "demo");
  const examples = listExamples(demoDir)
    .map((file) => readExample(demoDir, file, manifest.name))
    .sort(byRank);
  const scenarios = listScenarios(demoDir)
    .map((file) => readScenario(demoDir, file, manifest.name))
    .sort(byRank);

  const pages = outline.flatMap((rubric) => rubric.pages);
  for (const example of examples) {
    if (!pages.some((page) => page.id === example.pageId)) {
      throw new Error(`\`${example.pageId}/${example.id}\` is in a folder for which there is no page.`);
    }
  }

  const fullUrl = `${manifest.homepage}llms-full.txt`;
  const install = `pnpm add ${manifest.name}`;

  /* The index. */
  const index = [
    `# ${manifest.name}`,
    "",
    `> ${manifest.description}`,
    "",
    `Version ${manifest.version}. Install with \`${install}\`. Every page below in full - its examples' source, its props tables generated from the code, and what it deliberately does not do - stands in one file: [llms-full.txt](${fullUrl}). The npm package carries the same text for the installed version as \`docs/llms-full.md\`; prefer that one when the package is installed.`,
    "",
    ...(scenarios.length === 0
      ? []
      : [
          "## Scenarios",
          "",
          "Composed, realistic screens built from the package.",
          "",
          ...scenarios.map((scenario) => `- [${scenario.title}](${manifest.homepage}#/scenarios/${scenario.id}): ${scenario.lead}`),
          "",
        ]),
    ...outline.flatMap((rubric) => [
      `## ${rubric.name}`,
      "",
      rubric.sentence,
      "",
      ...rubric.pages.map((page) => `- [${page.name}](${pageUrl(manifest, page)}): ${page.sentence}`),
      "",
    ]),
  ].join("\n");

  /* The full text. */
  const shown = new Set<string>();
  const parts: string[] = [
    `# ${manifest.name} ${manifest.version}`,
    "",
    `> ${manifest.description}`,
    "",
    `Install with \`${install}\`. This text is generated from the package's demo (${manifest.homepage}): every page with its import line, its examples - the source exactly as it runs, with the package name where the demo imports its own source - its props tables generated from the code, and what it deliberately does not do. The pages index stands in ${manifest.homepage}llms.txt.`,
  ];
  const beside = (worlds: readonly string[]) => {
    if (worlds.length === 0) return;
    const names = worlds.map((world) => code(`${world}.ts`));
    parts.push("", `It imports ${names.join(", ")} from beside itself; the file stands once, under "Files the examples show" at the end.`);
    worlds.forEach((world) => shown.add(world));
  };
  if (scenarios.length > 0) {
    parts.push("", "## Scenarios", "", "Composed, realistic screens built from the package. A numbered mark on the screen is an element with `data-callout`.");
    for (const scenario of scenarios) {
      parts.push("", `### ${scenario.title}`, "", scenario.lead);
      if (scenario.callouts.length > 0) parts.push("", scenario.callouts.map((text, i) => `${i + 1}. ${text}`).join("\n"));
      const built = scenario.builtFrom.map((entry) => {
        if (typeof entry !== "string") return entry.name;
        return pages.find((page) => page.id === entry)?.name ?? entry;
      });
      parts.push("", `Built from: ${built.join(", ")}.`, "", fenced("tsx", scenario.source));
      beside(scenario.worlds);
    }
  }
  for (const rubric of outline) {
    parts.push("", `## ${rubric.name}`, "", rubric.sentence);
    for (const page of rubric.pages) {
      parts.push("", `### ${page.name}`, "", page.sentence, "", fenced("ts", `import { ${page.exports.join(", ")} } from "${manifest.name}";`));
      parts.push("", `Demo page: ${pageUrl(manifest, page)}`);
      if (page.about !== undefined) parts.push("", page.about.join("\n\n"));

      const own = examples.filter((example) => example.pageId === page.id);
      parts.push("", "#### Examples");
      if (own.length === 0) parts.push("", "There is no example for this page yet. The tables below are complete all the same - they come from the source.");
      for (const example of own) {
        parts.push("", `##### ${example.title}`);
        if (example.lead !== undefined) parts.push("", example.lead);
        parts.push("", fenced("tsx", example.source));
        beside(example.worlds);
      }

      if (page.alternatives !== undefined) {
        parts.push("", "#### When to use something else", "", page.alternatives.map(({ when, use }) => `- ${when} → ${pages.find((one) => one.id === use)?.name ?? use}`).join("\n"));
      }
      if (page.keys !== undefined) {
        parts.push("", "#### Keyboard", "", "| Key | Action |", "|---|---|", ...page.keys.map(({ key, action }) => `| ${cell(code(key))} | ${cell(action)} |`));
      }

      if (page.types.length > 0) {
        parts.push("", "#### API");
        for (const type of page.types) {
          const entry = tables[type];
          if (entry === undefined) throw new Error(`\`${type}\` has no generated table - did \`pnpm props\` run?`);
          parts.push("", tableMarkdown(entry));
        }
      }

      if (page.limits !== undefined) {
        parts.push("", "#### Known limits", "", page.limits.map((text) => `- ${text}`).join("\n"));
      }
    }
  }

  /* What no page names. After the pages, so that a page's mention counts
     first, and before the data files, whose names are the demo's and not the
     package's. */
  const pagesText = parts.join("\n");
  const rest = exportedDeclarations(packageDir).filter((one) => missingFrom(pagesText, [one.name]).length > 0);
  if (rest.length > 0) {
    parts.push(
      "",
      "## The rest of the API",
      "",
      "Exported as well, and named on no page above: the pure modules behind the components, and the types they are made of. Each with its declaration as the package's `.d.ts` carries it.",
    );
    for (const one of rest) {
      parts.push("", `### ${code(one.name)}`, "", fenced("ts", one.text === "" ? `// ${one.name}: no declaration found` : one.text));
    }
  }

  if (shown.size > 0) {
    parts.push("", "## Files the examples show", "", "The demos' shared data, which some examples import from beside themselves. Copied with the example, it runs.");
    for (const world of [...shown].sort()) {
      parts.push("", `### ${code(`${world}.ts`)}`, "", fenced("ts", readFileSync(join(worldsDir, `${world}.ts`), "utf8")));
    }
  }

  return { index, full: `${parts.join("\n")}\n` };
}

/** Writes `demo/.generated/llms.txt` and `docs/llms-full.md`. Neither is
    checked in: a generation drifts from its source (`.gitignore`). */
export function generateLlms(job: LlmsJob): void {
  const { index, full } = renderLlms(job);
  const indexPath = join(job.packageDir, "demo", ".generated", "llms.txt");
  const fullPath = join(job.packageDir, "docs", "llms-full.md");
  mkdirSync(dirname(indexPath), { recursive: true });
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(indexPath, index, "utf8");
  writeFileSync(fullPath, full, "utf8");
  process.stdout.write(`llms-full.md: ${Math.round(Buffer.byteLength(full) / 1024)} kB.\n`);
}
