/* The API index: one generated page per package with everything its entries
   export (.scratch/api-index, ADR-0044).

   Grouped by what an export is - Components, Hooks, Functions, Constants,
   Types, then one group per subpath under its import path - and alphabetical
   within a group, so that the page works as an index. A component with a page
   links there, with the page's lede; its props stand there and nowhere else. A
   hook, a function, a constant and a component without a page show their JSDoc
   and their declaration as the `.d.ts` has it. A type links to its table, or
   is defined here as "Types on this page" defines it - the same model and the
   same writer. Every entry names the pages that use it.

   One model, two writers, as the props tables (`apiTable.ts`): the app and
   the prerendered page mount the HTML, the llms text carries the Markdown.
   Pure, and without Vite, React or Node: the model is built in the generator
   and mounted in the browser, which is why the imports carry extensions. */

import type { ExportedDeclaration } from "./exportDocs.ts";
import type { TypeEntry } from "./propsReader.ts";
import {
  DEFINITIONS_ID,
  DEFINITIONS_TITLE,
  definitionModel,
  escape,
  fencedCode,
  linked,
  markdownCode,
  spansHtml,
  spansMarkdown,
  spansOf,
  tableHtml,
  tableMarkdown,
  type ApiDefinitionModel,
  type Span,
} from "./apiTable.ts";

/** A page of the demo as the index sees it. */
export interface IndexPage {
  id: string;
  name: string;
  sentence: string;
  types: readonly string[];
}

/** A page that names an export in code: its name, and its place (`#/given`). */
export interface Mention {
  name: string;
  href: string;
}

export interface ApiIndexEntry {
  name: string;
  /** Its id on the page: the name for a value, `type-<Name>` for a type. */
  anchor: string;
  /** The page or the table it stands on; for a component, the page's lede. */
  home?: { name: string; href: string; lede?: readonly Span[] };
  /** The `@deprecated` sentence, where it is. */
  deprecated?: readonly Span[];
  description: readonly Span[];
  /** The `@param` and `@returns` lines, under the prose. */
  notes: readonly (readonly Span[])[];
  /** A wording or a format directory: the sentence leading to the table of
      its entries. */
  values?: readonly Span[];
  /** The declaration as code, the library's types in it as links. */
  declaration?: readonly Span[];
  /** A type without a table: its definition. */
  definition?: ApiDefinitionModel;
  usedOn: readonly Mention[];
}

export interface ApiIndexGroup {
  /** The group heading's id. */
  id: string;
  title: string;
  entries: readonly ApiIndexEntry[];
}

export interface ApiIndexModel {
  groups: readonly ApiIndexGroup[];
  /** Types the entries name that the package does not export - defined
      after the groups, as a page defines them. */
  definitions: readonly ApiDefinitionModel[];
  /** Every export's anchor - what the built site's guard looks for. */
  anchors: readonly string[];
  /** What a page's text links to its entry (`linkedNames`). */
  linked: readonly string[];
}

export interface ApiIndexJob {
  /** The package name - a subpath group is named by its import path. */
  packageName: string;
  exports: readonly ExportedDeclaration[];
  pages: readonly IndexPage[];
  /** The generated tables and definitions (`props.json`). */
  entries: Readonly<Record<string, TypeEntry>>;
  /** The pages that name an export in code. */
  usedOn: (name: string) => readonly Mention[];
  /** `Page.values` of the index. */
  values?: Readonly<Record<string, string>>;
}

const GROUPS = [
  { kind: "component", id: "components", title: "Components" },
  { kind: "hook", id: "hooks", title: "Hooks" },
  { kind: "function", id: "functions", title: "Functions" },
  { kind: "constant", id: "constants", title: "Constants" },
  { kind: "type", id: "types", title: "Types" },
] as const;

/** The names a page's text and import line link to their entry on the index:
    the hooks and the functions, whose signature stands nowhere else. */
export function linkedNames(exports: readonly ExportedDeclaration[]): string[] {
  return exports.filter((one) => one.kind === "hook" || one.kind === "function").map((one) => one.name);
}

const text = (value: string): Span => ({ kind: "text", text: value });
const code = (value: string): Span => ({ kind: "code", text: value });

/** Alphabetical, case aside: `applyIntent` beside `ApplyOptions`. */
const byName = (a: { name: string }, b: { name: string }) =>
  a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : a.name < b.name ? -1 : 1;

export function apiIndexModel({ packageName, exports, pages, entries, usedOn, values = {} }: ApiIndexJob): ApiIndexModel {
  const exportedTypes = new Set(exports.filter((one) => one.kind === "type").map((one) => one.name));
  const tableOf = (name: string) => pages.find((page) => page.types.includes(name));
  /* A type a declaration or a definition names leads to its table, else to
     its entry on this page; a type the package does not export is defined
     after the groups. A name with neither stays text - `ReactNode`, `T`. */
  const defined: string[] = [];
  const linkOf = (name: string): string | undefined => {
    const home = tableOf(name);
    if (home !== undefined) return `#/${home.id}/type-${name}`;
    if (entries[name]?.definition === undefined) return undefined;
    if (!exportedTypes.has(name) && !defined.includes(name)) defined.push(name);
    return `#type-${name}`;
  };

  const entryOf = (one: ExportedDeclaration): ApiIndexEntry => {
    const common = {
      name: one.name,
      anchor: one.kind === "type" ? `type-${one.name}` : one.name,
      usedOn: usedOn(one.name),
      ...(one.deprecated === undefined ? {} : { deprecated: spansOf(one.deprecated) }),
      ...(values[one.name] === undefined ? {} : { values: spansOf(`Every entry, with its value, stands in ${values[one.name]}.`) }),
      description: [],
      notes: [],
    };
    if (one.kind === "type") {
      const home = tableOf(one.name);
      if (home !== undefined) return { ...common, home: { name: home.name, href: `#/${home.id}/type-${one.name}` } };
      const entry = entries[one.name];
      if (entry?.definition === undefined) throw new Error(`\`${one.name}\` is exported and has neither a table nor a definition - did \`pnpm props\` run?`);
      return { ...common, definition: definitionModel(entry, linkOf) };
    }
    /* A component's page is the one named after it, with that page's lede,
       else the one with its props table, with its own comment; one without
       either is shown like a function. */
    const named = pages.find((candidate) => candidate.name === one.name);
    const page = one.kind !== "component" ? undefined : (named ?? tableOf(`${one.name}Props`));
    if (page !== undefined) return { ...common, home: { name: page.name, href: `#/${page.id}`, lede: spansOf(page === named ? page.sentence : one.description) } };
    return {
      ...common,
      description: spansOf(one.description),
      notes: [
        ...one.params.map((param) => [code(param.name), text(" – "), ...spansOf(param.text)]),
        ...(one.returns === undefined ? [] : [[text("Returns "), ...spansOf(one.returns)]]),
      ],
      declaration: linked(one.declaration, one.references, linkOf),
    };
  };

  const main = exports.filter((one) => one.subpath === undefined);
  const subpaths = [...new Set(exports.flatMap((one) => (one.subpath === undefined ? [] : [one.subpath])))];
  const groups: ApiIndexGroup[] = [
    ...GROUPS.map(({ kind, id, title }) => ({ id: `group-${id}`, title, entries: main.filter((one) => one.kind === kind).sort(byName).map(entryOf) })),
    ...subpaths.map((subpath) => ({
      id: `group-${subpath.replace(/\W+/g, "-")}`,
      title: `${packageName}/${subpath}`,
      entries: exports.filter((one) => one.subpath === subpath).sort(byName).map(entryOf),
    })),
  ].filter((group) => group.entries.length > 0);

  const definitions: ApiDefinitionModel[] = [];
  /* `linkOf` adds to `defined` while it is walked. */
  for (let i = 0; i < defined.length; i++) definitions.push(definitionModel(entries[defined[i]!]!, linkOf));
  return { groups, definitions, anchors: exports.map((one) => (one.kind === "type" ? `type-${one.name}` : one.name)), linked: linkedNames(exports) };
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

/** `a`, `a and b`, `a, b and c` as links. */
function usedOnSpans(usedOn: readonly Mention[]): Span[] {
  return [
    text("Used on "),
    ...usedOn.flatMap((one, i) => [...(i === 0 ? [] : [text(i === usedOn.length - 1 ? " and " : ", ")]), { kind: "link" as const, text: one.name, href: one.href }]),
    text("."),
  ];
}

function homeSpans(entry: ApiIndexEntry): Span[] {
  const home = entry.home!;
  const link: Span = { kind: "link", text: home.name, href: home.href };
  return home.lede === undefined ? [text("Its table stands on "), link, text(".")] : [link, text(" – "), ...home.lede];
}

function entryHtml(entry: ApiIndexEntry): string {
  return (
    `<div class="apiBlock" data-export="${escape(entry.name)}">` +
    (entry.definition !== undefined
      ? tableHtml(entry.definition, 3)
      : `<h3 class="apiTitle" id="${escape(entry.anchor)}"><code>${escape(entry.name)}</code></h3>`) +
    (entry.deprecated === undefined ? "" : `<p class="apiProse apiDeprecated"><span class="apiBadge">Deprecated</span> ${spansHtml(entry.deprecated)}</p>`) +
    (entry.home === undefined ? "" : `<p class="apiProse">${spansHtml(homeSpans(entry))}</p>`) +
    (entry.description.length === 0 ? "" : `<p class="apiProse">${spansHtml(entry.description)}</p>`) +
    (entry.values === undefined ? "" : `<p class="apiProse">${spansHtml(entry.values)}</p>`) +
    (entry.notes.length === 0 ? "" : `<ul class="apiProse">${entry.notes.map((note) => `<li>${spansHtml(note)}</li>`).join("")}</ul>`) +
    (entry.declaration === undefined ? "" : `<pre class="apiDeclaration"><code>${spansHtml(entry.declaration)}</code></pre>`) +
    (entry.usedOn.length === 0 ? "" : `<p class="apiInherited">${spansHtml(usedOnSpans(entry.usedOn))}</p>`) +
    "</div>"
  );
}

function sectionHtml(id: string, title: string, body: string): string {
  return `<section class="section" aria-labelledby="${escape(id)}"><div class="sectionHead"><h2 class="sectionTitle" id="${escape(id)}">${escape(title)}</h2></div><div class="apiTables">${body}</div></section>`;
}

/** The index's body as HTML: a section a group, then the definitions. The
    app mounts this string; the prerendered page carries it. */
export function apiIndexHtml({ groups, definitions }: ApiIndexModel): string {
  return (
    groups.map((group) => sectionHtml(group.id, group.title, group.entries.map(entryHtml).join(""))).join("") +
    (definitions.length === 0 ? "" : sectionHtml(DEFINITIONS_ID, DEFINITIONS_TITLE, definitions.map((model) => tableHtml(model, 3)).join("")))
  );
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

function entryMarkdown(entry: ApiIndexEntry): string {
  const lines = entry.definition !== undefined ? [tableMarkdown(entry.definition)] : [`##### ${markdownCode(entry.name)}`];
  if (entry.deprecated !== undefined) lines.push("", `*Deprecated* ${spansMarkdown(entry.deprecated)}`);
  if (entry.home !== undefined) lines.push("", spansMarkdown(homeSpans(entry)));
  if (entry.description.length > 0) lines.push("", spansMarkdown(entry.description));
  if (entry.values !== undefined) lines.push("", spansMarkdown(entry.values));
  if (entry.notes.length > 0) lines.push("", ...entry.notes.map((note) => `- ${spansMarkdown(note)}`));
  /* A fence holds no link; the names it uses stand on this page or link from it. */
  if (entry.declaration !== undefined) lines.push("", fencedCode("ts", entry.declaration.map((span) => span.text).join("")));
  if (entry.usedOn.length > 0) lines.push("", spansMarkdown(usedOnSpans(entry.usedOn)));
  return lines.join("\n");
}

/** The index's body as Markdown, at the llms text's heading levels - a group
    `####`, an entry `#####` - each part a block of its own. */
export function apiIndexMarkdown({ groups, definitions }: ApiIndexModel): string[] {
  return [
    ...groups.flatMap((group) => [`#### ${group.title}`, ...group.entries.map(entryMarkdown)]),
    ...(definitions.length === 0 ? [] : [`#### ${DEFINITIONS_TITLE}`, ...definitions.map((model) => tableMarkdown(model))]),
  ];
}
