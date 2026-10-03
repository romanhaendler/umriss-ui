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

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Marked, type Tokens } from "marked";
import ts from "typescript";
import { ADR_0032, SCENARIOS, addressOfPlace, addresses, twinOfPlace } from "../outline.ts";
import type { Moved, Rubric, Page } from "../outline.ts";
import type { Forwarder } from "./site.ts";
import { byRank, parseFileName, parseScenarioName } from "./fileName.ts";
import { pageTitle } from "./title.ts";
import { displaySource } from "./source.ts";
import type { TypeEntry } from "./propsReader.ts";
import { installCommand, type InstallManifest } from "./install.ts";
import { PACKAGES } from "../packages.ts";
import { apiHtml, markdownCell as cell, markdownCode as code, tableMarkdown, tableModel } from "./apiTable.ts";
import { referenceHtml, referenceMarkdown, type ReferenceTable } from "./referenceTable.ts";
import { adrLinks } from "./props.ts";
import { linkAdrs, linkReferences, outlineTexts } from "./references.ts";

export interface LlmsJob {
  /** The package's directory: `package.json` and `demo/` are read there. */
  packageDir: string;
  outline: readonly Rubric[];
  /** The generated props tables - what `generateProps` just wrote. */
  tables: Readonly<Record<string, TypeEntry>>;
  /** The page ids that changed (`MOVED` in the outline): each gets a
      forwarder on the site. */
  moved?: Moved;
  /** The reference tables a page carries after its examples, by page id -
      core's Language page has its wording (`demo/tooling/languageTables.ts`). */
  references?: Readonly<Record<string, readonly ReferenceTable[]>>;
}

interface Manifest extends InstallManifest {
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

/** A place (`/gauge`, `#/gauge/basic`, `/scenarios/watch`) as the absolute
    address under the package's homepage - the format is `outline.ts`'s. */
function urlOf(homepage: string, place: string): string {
  return homepage + addressOfPlace(place).slice(1);
}

function pageUrl(manifest: Manifest, page: Page): string {
  return urlOf(manifest.homepage, `/${page.id}`);
}

/** The absolute address of a place's Markdown twin - the format is
    `outline.ts`'s too. */
function twinUrl(homepage: string, place: string): string {
  return homepage + twinOfPlace(place).slice(1);
}

/* ------------------------------------------------------------------ */
/* The site's pages                                                    */
/* ------------------------------------------------------------------ */

/** One prerendered page of the site: what a search engine reads before the
    demo starts (ADR-0037). */
export interface SitePage {
  /** Below the package's directory on the site: `""` for the front page,
      `gauge/` for a page. */
  path: string;
  url: string;
  /** The page's name, or the package's on the front page. */
  name: string;
  title: string;
  /** Plain text - the page's sentence without its marks. */
  description: string;
  /** What stands in `#root` until the demo replaces it. */
  html: string;
  /** The absolute address of the page's Markdown twin, which its head
      announces. */
  twin: string;
}

/** A page's Markdown twin (.scratch/pages-as-markdown), below the package's
    directory on the site: `gauge.md`, `index.md` for the scenarios page. */
export interface Twin {
  path: string;
  text: string;
}

function plain(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1").replace(/`+ ?([^`]+?) ?`+/g, "$1");
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The Markdown this file writes, as HTML. Headings are lifted by `lift`
    levels, so that a page's `###` becomes the document's `h1`; a heading
    named in `anchors` carries that id, so that an example's or a scenario's
    address points at it; a `#/page` link becomes that page's address; markup
    written in a text is shown, never passed through. */
function markdownToHtml(markdown: string, homepage: string, lift: number, anchors: ReadonlyMap<string, string> = new Map()): string {
  const marked = new Marked({
    renderer: {
      html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
      heading({ tokens, depth, text }: Tokens.Heading) {
        const id = anchors.get(text);
        return `<h${depth}${id === undefined ? "" : ` id="${id}"`}>${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
    walkTokens(token) {
      if (token.type === "heading") token.depth = Math.max(1, token.depth - lift);
      if (token.type === "link" && token.href.startsWith("#/")) token.href = urlOf(homepage, token.href);
    },
  });
  return (marked.parse(markdown, { async: false }) as string).trim();
}

/** The same Markdown as a page's twin: headings lifted by `lift` levels, so
    that the page's name is the `#`; `header` under that name; every `#/page`
    link absolute, so that the text still leads somewhere once it is copied
    out. Lifted token by token rather than line by line - an example's source
    may well hold a line that begins with `#`. */
function markdownTwin(markdown: string, homepage: string, lift: number, header: string): string {
  const body = new Marked()
    .lexer(markdown.trim())
    .map((token) => {
      if (token.type === "heading") return token.raw.replace(/^#+/, "#".repeat(Math.max(1, token.depth - lift)));
      if (token.type === "code") return token.raw;
      return token.raw.replace(/\]\((#\/[^)\s]*)\)/g, (_, href: string) => `](${urlOf(homepage, href)})`);
    })
    .join("");
  const [name, ...rest] = body.trim().split("\n");
  return `${[name, "", header, ...rest].join("\n")}\n`;
}

/** Both texts of one package, from its directory. Pure apart from reading. */
export function renderLlms({ packageDir, outline: written, tables, moved = {}, references = {} }: LlmsJob): {
  index: string;
  full: string;
  pages: SitePage[];
  forwarders: Forwarder[];
  twins: Twin[];
} {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as Manifest;
  const demoDir = join(packageDir, "demo");
  /* Every ADR number a text names, as a link to its file - as the shell
     shows the same texts (`references.ts`). The tables come linked. */
  const links = adrLinks();
  const link = (text: string) => linkAdrs(text, links);
  const outline = outlineTexts(written, link);
  const examples = listExamples(demoDir)
    .map((file) => readExample(demoDir, file, manifest.name))
    .map((example) => (example.lead === undefined ? example : { ...example, lead: link(example.lead) }))
    .sort(byRank);
  const scenarios = listScenarios(demoDir)
    .map((file) => readScenario(demoDir, file, manifest.name))
    .map((scenario) => ({ ...scenario, lead: link(scenario.lead), callouts: scenario.callouts.map(link) }))
    .sort(byRank);

  const pages = outline.flatMap((rubric) => rubric.pages);
  for (const example of examples) {
    if (!pages.some((page) => page.id === example.pageId)) {
      throw new Error(`\`${example.pageId}/${example.id}\` is in a folder for which there is no page.`);
    }
  }

  const fullUrl = `${manifest.homepage}llms-full.txt`;
  const install = installCommand(manifest);

  /* The index. */
  const index = [
    `# ${manifest.name}`,
    "",
    `> ${manifest.description}`,
    "",
    `Version ${manifest.version}. Install with \`${install}\`. Each link below leads to that page as Markdown. Every page below in full - its examples' source, its props tables generated from the code, and what it deliberately does not do - stands in one file: [llms-full.txt](${fullUrl}). The npm package carries the same text for the installed version as \`docs/llms-full.md\`; prefer that one when the package is installed.`,
    "",
    ...(scenarios.length === 0
      ? []
      : [
          "## Scenarios",
          "",
          "Composed, realistic screens built from the package.",
          "",
          ...scenarios.map((scenario) => `- [${scenario.title}](${twinUrl(manifest.homepage, `/${SCENARIOS}/${scenario.id}`)}): ${scenario.lead}`),
          "",
        ]),
    ...outline.flatMap((rubric) => [
      `## ${rubric.name}`,
      "",
      rubric.sentence,
      "",
      ...rubric.pages.map((page) => `- [${page.name}](${twinUrl(manifest.homepage, `/${page.id}`)}): ${page.sentence}`),
      "",
    ]),
  ].join("\n");

  /* The full text. */
  const parts: string[] = [
    `# ${manifest.name} ${manifest.version}`,
    "",
    `> ${manifest.description}`,
    "",
    `Install with \`${install}\`. This text is generated from the package's demo (${manifest.homepage}): every page with its import line, its examples - the source exactly as it runs, with the package name where the demo imports its own source - its props tables generated from the code, and what it deliberately does not do. The pages index stands in ${manifest.homepage}llms.txt.`,
  ];
  /* Where each page's part of the full text begins and ends - the site's
     pages are cut from it, so they cannot say anything else. The API section
     and the reference tables are the parts a site page does not take as
     Markdown: it carries the HTML the app mounts, written from the same
     model. */
  const cuts: { page?: Page; from: number; to: number; spliced?: readonly { from: number; to: number; html: string }[] }[] = [];
  if (scenarios.length > 0) {
    const from = parts.length;
    parts.push("", "## Scenarios", "", "Composed, realistic screens built from the package. A numbered mark on the screen is an element with `data-callout`.");
    for (const scenario of scenarios) {
      parts.push("", `### ${scenario.title}`, "", scenario.lead);
      if (scenario.callouts.length > 0) parts.push("", scenario.callouts.map((text, i) => `${i + 1}. ${text}`).join("\n"));
      const built = scenario.builtFrom.map((entry) => {
        if (typeof entry !== "string") return entry.name;
        return pages.find((page) => page.id === entry)?.name ?? entry;
      });
      parts.push("", `Built from: ${built.join(", ")}.`, "", fenced("tsx", scenario.source));
    }
    cuts.push({ from, to: parts.length });
  }
  for (const rubric of outline) {
    parts.push("", `## ${rubric.name}`, "", rubric.sentence);
    for (const page of rubric.pages) {
      const from = parts.length;
      parts.push("", `### ${page.name}`, "", page.sentence);
      if (page.exports.length > 0) parts.push("", fenced("ts", `import { ${page.exports.join(", ")} } from "${manifest.name}";`));
      if (page.installs === true) parts.push("", fenced("sh", install));
      parts.push("", `Demo page: ${pageUrl(manifest, page)}`);
      if (page.about !== undefined) parts.push("", page.about.join("\n\n"));

      const own = examples.filter((example) => example.pageId === page.id);
      parts.push("", "#### Examples");
      if (own.length === 0) parts.push("", "There is no example for this page yet. The tables below are complete all the same - they come from the source.");
      for (const example of own) {
        parts.push("", `##### ${example.title}`);
        if (example.lead !== undefined) parts.push("", example.lead);
        parts.push("", fenced("tsx", example.source));
      }

      const spliced: { from: number; to: number; html: string }[] = [];
      for (const table of references[page.id] ?? []) {
        parts.push("", `#### ${table.title}`);
        const at = parts.length;
        parts.push("", referenceMarkdown(table));
        spliced.push({ from: at, to: parts.length, html: referenceHtml(table) });
      }

      if (page.alternatives !== undefined) {
        parts.push("", "#### When to use something else", "", page.alternatives.map(({ when, use }) => `- ${when} → ${pages.find((one) => one.id === use)?.name ?? use}`).join("\n"));
      }
      if (page.keys !== undefined) {
        parts.push("", "#### Keyboard", "", "| Key | Action |", "|---|---|", ...page.keys.map(({ key, action }) => `| ${cell(code(key))} | ${cell(action)} |`));
      }

      if (page.types.length > 0) {
        parts.push("", "#### API");
        const models = page.types.map((type) => {
          const entry = tables[type];
          if (entry === undefined) throw new Error(`\`${type}\` has no generated table - did \`pnpm props\` run?`);
          return tableModel(entry);
        });
        const at = parts.length;
        for (const model of models) parts.push("", tableMarkdown(model));
        spliced.push({ from: at, to: parts.length, html: apiHtml(models) });
      }

      if (page.limits !== undefined) {
        parts.push("", "#### Known limits", "", page.limits.map((text) => `- ${text}`).join("\n"), "", `What umriss deliberately does not build, and why: [ADR-0032](${ADR_0032}).`);
      }
      cuts.push({ page, from, to: parts.length, spliced });
    }
  }

  /* What no page names. After the pages, so that a page's mention counts
     first. */
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


  /* The site's pages. Every one links every other, under its rubric - with
     no links from elsewhere (search-visibility, "only our own"), the links
     between our own pages are what a crawler walks. */
  const home = manifest.homepage;
  /* Written at a page's heading levels: `###` is the page, so `####` is h2. */
  const everyPage = [
    `#### Every page of ${manifest.name}`,
    "",
    ...outline.flatMap((rubric) => [`##### ${rubric.name}`, "", ...rubric.pages.map((page) => `- [${page.name}](${pageUrl(manifest, page)})`), ""]),
  ].join("\n");
  /* The landing's head as the app shows it: the npm name, the install
     command as a block, and the page to start with from the one list. */
  const startId = PACKAGES.find((one) => one.npm === manifest.name)?.start;
  const start = pages.find((page) => page.id === startId);
  /* The scenarios page's own text: the package, and the scenarios' cut. */
  const front = [
    `# ${manifest.name}`,
    "",
    manifest.description,
    "",
    fenced("sh", install),
    ...(start === undefined ? [] : ["", `[Start with ${start.name} →](${pageUrl(manifest, start)})`]),
    ...cuts.filter((cut) => cut.page === undefined).map((cut) => parts.slice(cut.from, cut.to).join("\n")),
  ].join("\n");
  /* What a twin says under its name: what it is part of, and where the rest
     stands. */
  const header = (url: string) =>
    `> Package \`${manifest.name}\`, version ${manifest.version}. Demo page: <${url}>. Every page in one line: [llms.txt](${home}llms.txt); every page in full: [llms-full.txt](${fullUrl}).`;
  const twins: Twin[] = [{ path: twinOfPlace("").slice(1), text: markdownTwin(front, home, 0, header(home)) }];
  const sitePages: SitePage[] = [
    {
      path: "",
      url: home,
      name: manifest.name,
      title: pageTitle(manifest),
      description: manifest.description,
      twin: twinUrl(home, ""),
      html: markdownToHtml(
        [
          front,
          "",
          ...outline.flatMap((rubric) => [
            `## ${rubric.name}`,
            "",
            rubric.sentence,
            "",
            ...rubric.pages.map((page) => `- [${page.name}](${pageUrl(manifest, page)}): ${page.sentence}`),
            "",
          ]),
        ].join("\n"),
        home,
        0,
        new Map(scenarios.map((scenario) => [scenario.title, scenario.id])),
      ),
    },
    ...cuts.flatMap(({ page, from, to, spliced = [] }) => {
      if (page === undefined) return [];
      /* The twin is the cut as it stands in the full text, without the list
         of every page: that is for a crawler, and an agent has `llms.txt`. */
      twins.push({ path: twinOfPlace(`/${page.id}`).slice(1), text: markdownTwin(parts.slice(from, to).join("\n"), home, 2, header(pageUrl(manifest, page))) });
      /* "Demo page: <this page>" is for the agent reading the full text; on
         the page itself it would point at itself. A reference table's heading
         carries the id the app gives it. */
      const anchors = new Map([
        ...examples.filter((example) => example.pageId === page.id).map((example) => [example.title, example.id] as const),
        ...(references[page.id] ?? []).map((table) => [table.title, table.anchor] as const),
      ]);
      const html = (a: number, b: number, tail = "") =>
        markdownToHtml(`${parts.slice(a, b).filter((line) => !line.startsWith("Demo page: ")).join("\n")}${tail}`, home, 2, anchors);
      /* Markdown up to each spliced section, its HTML, and on. */
      let at = from;
      let body = "";
      for (const one of spliced) {
        body += `${html(at, one.from)}\n<div class="apiTables">${one.html}</div>\n`;
        at = one.to;
      }
      return [
        {
          path: addressOfPlace(`/${page.id}`).slice(1),
          url: pageUrl(manifest, page),
          name: page.name,
          title: pageTitle(manifest, page.name),
          description: plain(page.sentence),
          twin: twinUrl(home, `/${page.id}`),
          html: `${body}${html(at, to, `\n\n${everyPage}`)}`,
        },
      ];
    }),
  ];

  /* An old address forwards to the page it is now; `addresses` throws on a
     moved id that collides or points nowhere. */
  const forwarders = Object.entries(addresses(outline, moved).MOVED).map(([old, current]): Forwarder => {
    const to = sitePages.find((page) => page.path === addressOfPlace(`/${current}`).slice(1))!;
    return { url: urlOf(home, `/${old}`), to: to.url, title: to.title };
  });

  return { index, full: `${parts.join("\n")}\n`, pages: sitePages, forwarders, twins };
}

/** Writes `demo/.generated/llms.txt`, `demo/.generated/pages.json` and
    `forwarders.json` (the site's pages and the forwarders at old addresses,
    which `scripts/build-pages.mjs` writes out), every page's Markdown twin
    under `demo/.generated/twins/` (the demo's public files, so that the dev
    server serves them and the build carries them beside the pages),
    `docs/llms-full.md`, and `demo/.generated/references.json` where there are
    reference tables, which the app mounts. None is checked in: a generation
    drifts from its source (`.gitignore`). Hands the site's pages back for a
    demo's guard over them. */
export function generateLlms(given: LlmsJob): SitePage[] {
  /* The reference tables' ADR numbers as links, for the text, the pages and
     the `references.json` the app mounts alike. */
  const job = given.references === undefined ? given : { ...given, references: linkReferences(given.references, adrLinks()) };
  const { index, full, pages, forwarders, twins } = renderLlms(job);
  const indexPath = join(job.packageDir, "demo", ".generated", "llms.txt");
  const fullPath = join(job.packageDir, "docs", "llms-full.md");
  mkdirSync(dirname(indexPath), { recursive: true });
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(indexPath, index, "utf8");
  writeFileSync(join(dirname(indexPath), "pages.json"), JSON.stringify(pages), "utf8");
  writeFileSync(join(dirname(indexPath), "forwarders.json"), JSON.stringify(forwarders), "utf8");
  writeFileSync(fullPath, full, "utf8");
  /* Anew every time: a page that is gone must not leave its twin behind. */
  const twinsDir = join(dirname(indexPath), "twins");
  rmSync(twinsDir, { recursive: true, force: true });
  mkdirSync(twinsDir);
  for (const twin of twins) writeFileSync(join(twinsDir, twin.path), twin.text, "utf8");
  if (job.references !== undefined) writeFileSync(join(dirname(indexPath), "references.json"), `${JSON.stringify(job.references, null, 2)}\n`, "utf8");
  process.stdout.write(`llms-full.md: ${Math.round(Buffer.byteLength(full) / 1024)} kB.\n`);
  return pages;
}
