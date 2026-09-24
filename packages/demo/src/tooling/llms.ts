/* The demo as text for a coding agent: `llms.txt` and `llms-full.txt`
   (.scratch/ai-readable-docs, A1).

   Nothing here is written twice. The pages come from the outline, the tables
   from the same `props.json` the demo renders, the examples from the same files
   through the same two string functions (`displaySource`, `asPackage`), and the
   "Why it is like this" pages from the same TSX. So the text an agent reads is
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
import { dirname, join, posix } from "node:path";
import ts from "typescript";
import type { Rubric, Page } from "../outline.ts";
import { byRank, parseFileName } from "./fileName.ts";
import { asPackage, displaySource } from "./source.ts";
import type { TypeEntry } from "./propsReader.ts";

export interface LlmsJob {
  /** The package's directory: `package.json` and `demo/` are read there. */
  packageDir: string;
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
  demonstration: boolean;
  title: string;
  source: string;
  /** The demo's own files it shows beside itself, as `./data.ts`. */
  shows: readonly string[];
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
/* "Why it is like this": TSX to Markdown                              */
/* ------------------------------------------------------------------ */

/* The entities the why pages use, and the few a writer reaches for next. An
   unknown one throws: a literal "&foo;" in the text would be a quiet lie. */
const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  hellip: "…",
  ndash: "–",
  mdash: "—",
};

function decode(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, name: string) => {
    if (name.startsWith("#x")) return String.fromCodePoint(parseInt(name.slice(2), 16));
    if (name.startsWith("#")) return String.fromCodePoint(Number(name.slice(1)));
    const found = ENTITIES[name];
    if (found === undefined) throw new Error(`A why page uses the entity \`${whole}\`, which the llms.txt generator does not know.`);
    return found;
  });
}

/* React's rule for JSX text: a line break and the indentation around it
   vanish, and the lines that remain are joined by one space. */
function jsxText(raw: string): string {
  const lines = raw.split(/\r?\n/);
  if (lines.length === 1) return raw;
  return lines
    .map((line, i) => {
      let out = line;
      if (i > 0) out = out.trimStart();
      if (i < lines.length - 1) out = out.trimEnd();
      return out;
    })
    .filter((line) => line !== "")
    .join(" ");
}

type JsxChild = ts.JsxChild;

function tagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  return tag.getText();
}

function attribute(node: ts.JsxElement, name: string): string | undefined {
  for (const property of node.openingElement.attributes.properties) {
    if (ts.isJsxAttribute(property) && property.name.getText() === name && property.initializer !== undefined) {
      if (ts.isStringLiteral(property.initializer)) return property.initializer.text;
    }
  }
  return undefined;
}

interface WhyOptions {
  /** What an `<h3>` becomes: the level below the section it stands in. */
  heading: string;
  /** The demo's address, for a link to another page (`#/meter`). */
  base: string;
}

/** A why page's TSX as Markdown. Only the handful of elements the why pages
    use is known; anything else throws, so a new one is noticed at build time
    instead of vanishing from the text. */
export function whyMarkdown(tsx: string, { heading, base }: WhyOptions): string {
  const file = ts.createSourceFile("why.tsx", tsx, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const inline = (children: readonly JsxChild[]): string => children.map(inlineOne).join("");

  function inlineOne(node: JsxChild): string {
    if (ts.isJsxText(node)) return decode(jsxText(node.text));
    if (ts.isJsxExpression(node)) {
      if (node.expression === undefined) return "";
      if (ts.isStringLiteral(node.expression)) return node.expression.text;
      throw new Error(`A why page computes \`{${node.expression.getText()}}\`; the text generator takes only literal text.`);
    }
    if (ts.isJsxElement(node)) {
      const name = tagName(node);
      const inner = inline(node.children);
      switch (name) {
        case "code":
          return code(inner);
        case "strong":
          return `**${inner}**`;
        case "em":
          return `*${inner}*`;
        case "a": {
          const href = attribute(node, "href") ?? "";
          return `[${inner}](${href.startsWith("#") ? `${base}${href}` : href})`;
        }
      }
      throw new Error(`A why page uses \`<${name}>\` inline, which the text generator does not know.`);
    }
    throw new Error(`A why page holds \`${node.getText()}\`, which the text generator does not know.`);
  }

  const blocks: string[] = [];
  function block(node: JsxChild): void {
    if (ts.isJsxText(node)) {
      if (node.text.trim() !== "") throw new Error(`A why page has loose text: "${node.text.trim()}".`);
      return;
    }
    if (ts.isJsxExpression(node) && node.expression === undefined) return;
    if (ts.isJsxFragment(node)) {
      node.children.forEach(block);
      return;
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = tagName(node);
      const children = ts.isJsxElement(node) ? node.children : ts.factory.createNodeArray<JsxChild>();
      if (name === "h3") blocks.push(`${heading} ${inline(children).trim()}`);
      else if (name === "p") blocks.push(inline(children).trim());
      else if (name === "ul") {
        blocks.push(
          children
            .filter((child) => ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || (ts.isJsxText(child) && child.text.trim() !== ""))
            .map((child) => {
              if (!ts.isJsxElement(child) || tagName(child) !== "li") throw new Error("A why page's `<ul>` holds something other than `<li>`.");
              return `- ${inline(child.children).trim()}`;
            })
            .join("\n"),
        );
      } else throw new Error(`A why page uses \`<${name}>\` as a block, which the text generator does not know.`);
      return;
    }
    throw new Error(`A why page holds \`${node.getText()}\`, which the text generator does not know.`);
  }

  /* The first JSX in the file is what the default export returns - a why page
     is one component with one return, and nothing else. */
  let root: ts.Node | undefined;
  const find = (node: ts.Node): void => {
    if (root !== undefined) return;
    if (ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node)) root = node;
    else ts.forEachChild(node, find);
  };
  find(file);
  if (root === undefined) throw new Error("A why page renders no JSX.");
  block(root as JsxChild);

  return `${blocks.join("\n\n")}\n`;
}

/* ------------------------------------------------------------------ */
/* Reading the demo from disk                                          */
/* ------------------------------------------------------------------ */

/* What `readExamples` takes from the running module, read from the text
   instead: every title and every `shows` is one line in the workspace, and a
   form this does not read throws rather than being guessed at. */
const TITLE = /^export const title = ("(?:[^"\\]|\\.)*");$/m;
const SHOWS = /^export const shows = (\[[^\]]*\]);$/m;

function readExample(demoDir: string, file: string, packageName: string): ExampleText {
  const path = `./examples/${file}`;
  const raw = readFileSync(join(demoDir, "examples", file), "utf8");
  const title = TITLE.exec(raw);
  if (title === null) throw new Error(`\`${path}\` has no \`export const title = "…";\` on one line.`);
  const shows = SHOWS.exec(raw);
  const { pageId, id, rank, demonstration } = parseFileName(path);
  return {
    pageId,
    id,
    rank,
    demonstration,
    title: JSON.parse(title[1]!) as string,
    source: displaySource(raw, packageName),
    /* Relative to the example, resolved against the demo directory - the key
       the demo's own `beside` glob uses. */
    shows: shows === null ? [] : (JSON.parse(shows[1]!) as string[]).map((one) => `./${posix.join(posix.dirname(path), one)}`),
  };
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
    line, its tables, its examples and a why page's `<code>` stand. An export
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
export function renderLlms({ packageDir, outline, tables }: LlmsJob): { index: string; full: string } {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as Manifest;
  const demoDir = join(packageDir, "demo");
  const examples = listExamples(demoDir)
    .map((file) => readExample(demoDir, file, manifest.name))
    .sort(byRank);
  const whyDir = join(demoDir, "why");
  /* A demo without a single why page has no directory for them either. */
  const whyFiles = new Set(existsSync(whyDir) ? readdirSync(whyDir).filter((name) => name.endsWith(".tsx")) : []);

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
    `Version ${manifest.version}. Install with \`${install}\`. Every page below in full - its examples' source, its props tables generated from the code, and why it is built the way it is - stands in one file: [llms-full.txt](${fullUrl}). The npm package carries the same text for the installed version as \`docs/llms-full.md\`; prefer that one when the package is installed.`,
    "",
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
    `Install with \`${install}\`. This text is generated from the package's demo (${manifest.homepage}): every page with its import line, its examples - the source exactly as it runs, with the package name where the demo imports its own source - its props tables generated from the code, and why it is built the way it is. The pages index stands in ${manifest.homepage}llms.txt.`,
  ];
  for (const rubric of outline) {
    parts.push("", `## ${rubric.name}`, "", rubric.sentence);
    for (const page of rubric.pages) {
      parts.push("", `### ${page.name}`, "", page.sentence, "", fenced("ts", `import { ${page.exports.join(", ")} } from "${manifest.name}";`));
      parts.push("", `Demo page: ${pageUrl(manifest, page)}`);

      const own = examples
        .filter((example) => example.pageId === page.id)
        /* `examplesOf`'s order, the demonstration last. Not imported: the
           shell's `examples.ts` imports without extensions for Vite, which
           Node's type stripping cannot follow. */
        .sort((a, b) => Number(a.demonstration) - Number(b.demonstration));
      parts.push("", "#### Examples");
      if (own.length === 0) parts.push("", "There is no example for this page yet. The tables below are complete all the same - they come from the source.");
      for (const example of own) {
        parts.push("", `##### ${example.title}`, "", fenced("tsx", example.source));
        if (example.shows.length > 0) {
          const names = example.shows.map((key) => code(posix.basename(key)));
          parts.push("", `It imports ${names.join(", ")} from beside itself; the file stands once, under "Files the examples show" at the end.`);
          example.shows.forEach((key) => shown.add(key));
        }
      }

      if (page.types.length > 0) {
        parts.push("", "#### API");
        for (const type of page.types) {
          const entry = tables[type];
          if (entry === undefined) throw new Error(`\`${type}\` has no generated table - did \`pnpm props\` run?`);
          parts.push("", tableMarkdown(entry));
        }
      }

      if (whyFiles.has(`${page.id}.tsx`)) {
        const tsx = readFileSync(join(whyDir, `${page.id}.tsx`), "utf8");
        parts.push("", "#### Why it is like this", "", whyMarkdown(tsx, { heading: "#####", base: manifest.homepage }).trimEnd());
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
    parts.push("", "## Files the examples show", "", "The demo's own data, which some examples import from beside themselves. Copied with the example, it runs.");
    for (const key of [...shown].sort()) {
      const text = asPackage(readFileSync(join(demoDir, key), "utf8"), manifest.name);
      parts.push("", `### ${code(posix.basename(key))}`, "", fenced(key.endsWith(".tsx") ? "tsx" : "ts", text));
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
