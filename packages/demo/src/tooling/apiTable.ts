/* A props table: one model, two writers (.scratch/types-without-holes).

   `tableModel` turns one generated entry into what a reader takes from it - a
   heading with its anchor, the rows in their groups, each cell as a run of
   marked pieces, a row's badges, the sentences that close the table. One
   writer turns that into HTML, the other into Markdown, and everything that
   shows a table takes it from them: the page the app shows mounts the HTML,
   the prerendered page carries the same HTML, the llms text the Markdown.
   Once the app drew its own table beside a Markdown one, and the two drifted
   (`*` against "(required)", events apart in one and not the other); a test
   holds the writers to the model now (`tests-unit/apiTable.test.ts`).

   Pure, and without Vite, React or Node: it runs in the browser and in the
   generator alike, which is why the import carries its extension. */

import { addressOfPlace } from "../outline.ts";
import type { PropEntry, ShownIn, TypeEntry } from "./propsReader.ts";

/** A piece of a written text - the marks a page's texts may carry. */
export type Span =
  | { kind: "text" | "code" | "bold"; text: string }
  | { kind: "link"; text: string; href: string }
  /** A colour drawn by the browser: `text` is the CSS value painted, in the
      given `color-scheme` - the token table's swatches. Decoration: the
      Markdown leaves it out, and the HTML hides it from a screen reader. */
  | { kind: "swatch"; text: string; scheme: "light" | "dark" };

export interface ApiRow {
  name: string;
  /** The type cell, the library's types in it as links. */
  type: readonly Span[];
  /** The values of a literal-union alias, on the line beneath its name:
      `"sm" | "md"` under `ButtonSize`. */
  expansion?: string;
  /** A value as one piece of code; a phrase as the text it was written as. */
  defaultValue?: readonly Span[];
  /** The `@deprecated` sentence - its row stands last in its group. */
  deprecated?: readonly Span[];
  description: readonly Span[];
  /** The type of this library the prop is inherited from. */
  origin?: string;
  /** Small labels after the name - `required`. */
  badges: readonly string[];
  /** "Shown in" and up to three examples as links, then "and N more" -
      absent where no example uses the row (.scratch/props-to-examples). */
  shownIn?: readonly Span[];
}

export interface ApiGroup {
  /** Names the table for a screen reader: `props`, `events`, `accessibility`, `styling`. */
  label: string;
  /** A heading above the table - every group but the main one; in a long
      table the summary of the group's fold. */
  title?: string;
  rows: readonly ApiRow[];
}

export interface ApiTableModel {
  name: string;
  /** The name with its parameters: `TableProps<T>`. */
  heading: string;
  /** The heading's id: `type-<Name>`. */
  anchor: string;
  /** Empty where the type declares no props of its own. */
  groups: readonly ApiGroup[];
  /** The sentences after the tables. */
  closing: readonly (readonly Span[])[];
}

/** A type without a table, as "Types on this page" defines it: its heading
    and members as a table's, or its declaration in place of the members. */
export interface ApiDefinitionModel extends ApiTableModel {
  /** The package it comes from, where that is another one. */
  from?: string;
  /** The type's own JSDoc. */
  description: readonly Span[];
  /** The declaration as code, the library's types in it as links. */
  declaration?: readonly Span[];
  /** The literals an alias of another alias comes to, as a row's beneath its
      name: `"sm" | "md"` for `type ButtonSize = ControlSize`. */
  expansion?: string;
}

/** A page's API section: its tables, in the order of its outline, and the
    types they name that have no table on any page. */
export interface ApiSection {
  tables: readonly ApiTableModel[];
  definitions: readonly ApiDefinitionModel[];
}

/** Where a type's name leads; `undefined` leaves it text. */
export type LinkOf = (name: string) => string | undefined;

/** The marks a text may carry: `code` in backticks, a [link](#/page) and
    **bold**. Everything else is plain text. */
const MARK = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

/** A text written with marks, as its pieces. */
export function spansOf(text: string): Span[] {
  const out: Span[] = [];
  let at = 0;
  for (const match of text.matchAll(MARK)) {
    if (match.index > at) out.push({ kind: "text", text: text.slice(at, match.index) });
    const [, code, label, href, bold] = match;
    if (code !== undefined) out.push({ kind: "code", text: code });
    else if (bold !== undefined) out.push({ kind: "bold", text: bold });
    else out.push({ kind: "link", text: label!, href: href! });
    at = match.index + match[0].length;
  }
  if (at < text.length) out.push({ kind: "text", text: text.slice(at) });
  return out;
}

const text = (value: string): Span => ({ kind: "text", text: value });
const code = (value: string): Span => ({ kind: "code", text: value });

/** `a`, `a and b`, `a, b and c`. */
function listed(names: readonly string[]): Span[] {
  return names.flatMap((name, i) => [
    ...(i === 0 ? [] : [text(i === names.length - 1 ? " and " : ", ")]),
    code(name),
  ]);
}

/** A string literal, or a name. */
const TOKEN = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[A-Za-z_$][\w$]*/g;

/** Code as pieces: each name of `references` that leads somewhere a link,
    the rest text - a name inside a string literal stays text. */
function linked(value: string, references: readonly string[], linkOf: LinkOf): Span[] {
  const out: Span[] = [];
  let at = 0;
  const flush = (to: number) => {
    if (to > at) out.push(text(value.slice(at, to)));
  };
  for (const match of value.matchAll(TOKEN)) {
    const href = references.includes(match[0]) ? linkOf(match[0]) : undefined;
    if (href === undefined) continue;
    flush(match.index);
    out.push({ kind: "link", text: match[0], href });
    at = match.index + match[0].length;
  }
  flush(value.length);
  return out;
}

/** How many examples a row names before "and N more". */
const SHOWN = 3;

/** The "Shown in" line: the examples of the page the table stands on first,
    in the data's order otherwise; one on another page with that page's name. */
function shownLine(shown: readonly ShownIn[], pageId: string | undefined): Span[] {
  const ordered = [...shown.filter((one) => one.page === pageId), ...shown.filter((one) => one.page !== pageId)];
  const links = ordered.slice(0, SHOWN).flatMap((one, i): Span[] => [
    ...(i === 0 ? [] : [text(", ")]),
    { kind: "link", text: one.page === pageId ? one.title : `${one.title} (${one.pageName})`, href: `#/${one.page}/${one.example}` },
  ]);
  const more = ordered.length - SHOWN;
  return [text("Shown in: "), ...links, ...(more > 0 ? [text(` and ${more} more`)] : [])];
}

function row(prop: PropEntry, linkOf: LinkOf, pageId?: string): ApiRow {
  return {
    name: prop.name,
    type: linked(prop.type, prop.references ?? [], linkOf),
    ...(prop.expansion === undefined ? {} : { expansion: prop.expansion }),
    ...(prop.defaultValue === undefined
      ? {}
      : { defaultValue: prop.defaultIsPhrase === true ? spansOf(prop.defaultValue) : [code(prop.defaultValue)] }),
    ...(prop.deprecated === undefined ? {} : { deprecated: spansOf(prop.deprecated) }),
    description: spansOf(prop.description),
    ...(prop.inheritedFrom === undefined ? {} : { origin: prop.inheritedFrom }),
    badges: prop.optional ? [] : ["required"],
    ...(prop.shownIn === undefined || prop.shownIn.length === 0 ? {} : { shownIn: shownLine(prop.shownIn, pageId) }),
  };
}

/* The groups (.scratch/props-table-hygiene): decided by rules on the name, the
   same in every table of every package and every output, so that nobody
   curates them by hand. In the order a table reads; the main group has no
   heading. */
const GROUPS = [
  { label: "props" },
  { label: "events", title: "Events" },
  { label: "accessibility", title: "Accessibility" },
  { label: "styling", title: "Styling" },
] as const;

type GroupLabel = (typeof GROUPS)[number]["label"];

const lowered = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);
const raised = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
/** `onValueChange` → `value`. */
const changed = (name: string) => /^on([A-Z]\w*)Change$/.exec(name)?.[1];
/** `defaultValue` → `value`. */
const defaulted = (name: string) => /^default([A-Z]\w*)$/.exec(name)?.[1];

/** The rules, in this order; a name no rule takes stands in the main group,
    so a new prop is never lost. */
function groupOf(name: string, names: ReadonlySet<string>): GroupLabel {
  if (/^(className|style)$|(ClassName|Style)$/.test(name)) return "styling";
  if (/^aria(-|[A-Z])/.test(name) || name === "role") return "accessibility";
  /* A controlled callback is no event: it stands by the prop it controls. */
  const controlled = changed(name);
  if (controlled !== undefined && names.has(lowered(controlled))) return groupOf(lowered(controlled), names);
  if (/^on[A-Z]/.test(name)) return "events";
  return "props";
}

/** One group's rows: declaration order with two moves - `defaultValue` just
    before `value`, `onValueChange` just after it - and the deprecated last,
    so that the current API reads first. */
function arranged(props: readonly PropEntry[]): PropEntry[] {
  const arrange = (some: readonly PropEntry[]) => {
    const named = new Map(some.map((prop) => [prop.name, prop]));
    const moved = (name: string) => {
      const x = changed(name) ?? defaulted(name);
      return x !== undefined && named.has(lowered(x));
    };
    return some.flatMap((prop) =>
      moved(prop.name) ? [] : [named.get(`default${raised(prop.name)}`), prop, named.get(`on${raised(prop.name)}Change`)].filter((one) => one !== undefined),
    );
  };
  return [...arrange(props.filter((prop) => prop.deprecated === undefined)), ...arrange(props.filter((prop) => prop.deprecated !== undefined))];
}

/** One entry as a table: the main group, then Events, Accessibility and
    Styling - each only where a row falls into it. `linkOf` says where a type
    a cell names leads. */
export function tableModel(entry: TypeEntry, linkOf: LinkOf = () => undefined, pageId?: string): ApiTableModel {
  const names = new Set(entry.props.map((prop) => prop.name));
  const alsoTakes = entry.alsoTakes ?? [];
  const closing: Span[][] = [];
  /* The parts of a type that have a table of their own on the page - named
     rather than copied out again. */
  if (alsoTakes.length > 0) closing.push([text("Also every prop of "), ...listed(alsoTakes), text(".")]);
  /* What React declares for the element being carried does not stand in the
     table as two hundred and fifty rows but as one sentence underneath. */
  if (entry.inherits !== undefined) {
    closing.push([
      text("Also takes every attribute of "),
      entry.inherits.startsWith("<") ? code(entry.inherits) : text(entry.inherits),
      ...(entry.omitted.length === 0
        ? []
        : [text(" – without "), ...entry.omitted.flatMap((name, i) => [...(i === 0 ? [] : [text(", ")]), code(name)])]),
      text("."),
    ]);
  }
  return {
    name: entry.name,
    heading: entry.parameter.length === 0 ? entry.name : `${entry.name}<${entry.parameter.join(", ")}>`,
    anchor: `type-${entry.name}`,
    groups: GROUPS.flatMap((group) => {
      const rows = arranged(entry.props.filter((prop) => groupOf(prop.name, names) === group.label)).map((prop) => row(prop, linkOf, pageId));
      return rows.length === 0 ? [] : [{ ...group, rows }];
    }),
    closing,
  };
}

/** A page with the tables it shows - what the outline says of it. */
export interface ApiPage {
  id: string;
  types: readonly string[];
}

/** A page's API section. A type a cell names leads to its table - on this
    page as an anchor, else on the page that has it - and otherwise to its
    definition on this page, which is then defined here: every type the
    tables name, and every type those definitions name, in the order they are
    first named. A type that has neither stops the generator: a cell would
    name what nobody explains. */
export function apiSection(page: ApiPage, pages: readonly ApiPage[], entries: Readonly<Record<string, TypeEntry>>): ApiSection {
  const entryOf = (name: string): TypeEntry => {
    const entry = entries[name];
    if (entry === undefined) throw new Error(`\`${name}\` has no generated table - did \`pnpm props\` run?`);
    return entry;
  };
  const defined: string[] = [];
  const linkOf = (name: string): string => {
    const home = pages.find((one) => one.types.includes(name));
    if (home !== undefined) return home.id === page.id ? `#type-${name}` : `#/${home.id}/type-${name}`;
    if (entries[name]?.definition === undefined) {
      throw new Error(`\`${name}\` is named on the page \`${page.id}\` and has neither a table nor a definition.`);
    }
    if (!defined.includes(name)) defined.push(name);
    return `#type-${name}`;
  };
  const tables = page.types.map((name) => tableModel(entryOf(name), linkOf, page.id));
  const definitions: ApiDefinitionModel[] = [];
  /* `linkOf` adds to `defined` while it is walked. */
  for (let i = 0; i < defined.length; i++) {
    const entry = entryOf(defined[i]!);
    const definition = entry.definition!;
    definitions.push({
      ...tableModel(entry, linkOf, page.id),
      ...(definition.from === undefined ? {} : { from: definition.from }),
      description: spansOf(definition.description),
      ...(definition.declaration === undefined ? {} : { declaration: linked(definition.declaration, definition.references ?? [], linkOf) }),
      ...(definition.expansion === undefined ? {} : { expansion: definition.expansion }),
    });
  }
  return { tables, definitions };
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

export const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A link in a text is an ordinary address. `#/page` - the place as the texts
    write it - becomes the page's address relative to the page the table stands
    on, which is one directory below the demo's base on the dev server, on the
    site and in the prerendered page alike: the same HTML everywhere, and the
    shell takes the click like any other link to its own pages. */
function hrefOf(href: string): string {
  return href.startsWith("#/") ? `..${addressOfPlace(href)}` : href;
}

/** A type's members where it is a union of more than two, else `undefined`
    (.scratch/a11y-and-finish, 07). Split at a `|` outside brackets and
    quotes; a function or a conditional type is one type, whatever unions its
    parts hold. A name a link carries never holds a `|`. */
export function unionMembers(spans: readonly Span[]): Span[][] | undefined {
  const members: Span[][] = [[]];
  let depth = 0;
  let quote: string | undefined;
  for (const span of spans) {
    if (span.kind !== "text") {
      members.at(-1)!.push(span);
      continue;
    }
    const value = span.text;
    let from = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value[i]!;
      if (quote !== undefined) {
        if (char === "\\") i++;
        else if (char === quote) quote = undefined;
      } else if (char === '"' || char === "'" || char === "`") quote = char;
      else if ("([{<".includes(char)) depth++;
      else if (")]}".includes(char) || (char === ">" && value[i - 1] !== "=")) depth--;
      else if (depth === 0 && (char === "?" || (char === "=" && value[i + 1] === ">"))) return undefined;
      else if (depth === 0 && char === "|") {
        members.at(-1)!.push(text(value.slice(from, i)));
        members.push([]);
        from = i + 1;
      }
    }
    members.at(-1)!.push(text(value.slice(from)));
  }
  const trimmed = members
    .map((member) =>
      member
        .map((span, i) => {
          if (span.kind !== "text") return span;
          const start = i === 0 ? span.text.trimStart() : span.text;
          return text(i === member.length - 1 ? start.trimEnd() : start);
        })
        .filter((span) => span.text !== ""),
    )
    /* A union written with a leading `|`. */
    .filter((member) => member.length > 0);
  return trimmed.length > 2 ? trimmed : undefined;
}

/** A type as HTML: a union of more than two members one member a line, each
    line starting with `|`; anything else as it stands. */
function typeHtml(spans: readonly Span[]): string {
  const members = unionMembers(spans);
  return members === undefined ? spansHtml(spans) : members.map((member) => `| ${spansHtml(member)}`).join("<br>");
}

/** Pieces as HTML - the writers' one way of writing a text. */
export function spansHtml(spans: readonly Span[]): string {
  return spans
    .map((span) => {
      const inner = escape(span.text);
      if (span.kind === "code") return `<code>${inner}</code>`;
      if (span.kind === "bold") return `<strong>${inner}</strong>`;
      if (span.kind === "link") return `<a href="${escape(hrefOf(span.href))}">${inner}</a>`;
      if (span.kind === "swatch") return `<span class="tokenSwatch" aria-hidden="true" style="background:${inner};color-scheme:${span.scheme}"></span>`;
      return inner;
    })
    .join("");
}

/* A table of more than this many rows folds its secondary groups
   (.scratch/props-table-hygiene, 02). Folding is the HTML's matter alone: the
   Markdown writes every group out, and the folded rows stand in the HTML too -
   the browser's find reaches them, and the shell opens a fold that holds the
   row an address names (`Shell.tsx`). */
const FOLD_OVER = 15;

function groupHtml(name: string, group: ApiGroup, fold: boolean): string {
  const rows = group.rows.map(
    (one) =>
      /* `<Type>-<prop>`: a row is an address (.scratch/props-to-examples). */
      `<tr id="${escape(`${name}-${one.name}`)}">` +
      /* The name is a link to its own row, so that its address can be copied. */
      `<th scope="row"><a class="apiAnchor" href="#${escape(`${name}-${one.name}`)}"><code>${escape(one.name)}</code></a>${one.badges.map((badge) => `<span class="apiBadge">${escape(badge)}</span>`).join("")}</th>` +
      `<td><code class="apiType">${typeHtml(one.type)}</code>${one.expansion === undefined ? "" : `<br><code>${typeHtml([text(one.expansion)])}</code>`}</td>` +
      `<td>${one.defaultValue === undefined ? "—" : spansHtml(one.defaultValue)}</td>` +
      `<td>${one.deprecated === undefined ? "" : `<span class="apiDeprecated"><span class="apiBadge">Deprecated</span> ${spansHtml(one.deprecated)}</span> `}${spansHtml(one.description)}${one.origin === undefined ? "" : `<span class="apiOrigin"> from <code>${escape(one.origin)}</code></span>`}${one.shownIn === undefined ? "" : `<p class="apiShown">${spansHtml(one.shownIn)}</p>`}</td>` +
      "</tr>",
  );
  const table =
    `<div class="apiRole"><table class="apiTable" aria-label="${escape(`${name}: ${group.label}`)}">` +
    '<thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead>' +
    `<tbody>${rows.join("")}</tbody></table></div>`;
  if (group.title === undefined) return table;
  if (fold) return `<details class="apiFold"><summary class="apiGroupTitle">${escape(`${group.title} · ${group.rows.length}`)}</summary>${table}</details>`;
  return `<h4 class="apiGroupTitle">${escape(group.title)}</h4>${table}`;
}

/** One table as HTML - no whitespace between the elements, as React writes it. */
export function tableHtml(model: ApiTableModel | ApiDefinitionModel, level = 3): string {
  const definition = "description" in model ? model : undefined;
  const fold = model.groups.reduce((count, group) => count + group.rows.length, 0) > FOLD_OVER;
  return (
    `<div class="apiBlock" data-type="${escape(model.name)}">` +
    `<h${level} class="apiTitle" id="${escape(model.anchor)}"><code>${escape(model.heading)}</code></h${level}>` +
    (definition?.from === undefined ? "" : `<p class="apiInherited">From <code>${escape(definition.from)}</code>.</p>`) +
    (definition === undefined || definition.description.length === 0 ? "" : `<p class="apiProse">${spansHtml(definition.description)}</p>`) +
    (definition?.declaration !== undefined
      ? `<pre class="apiDeclaration"><code>${spansHtml(definition.declaration)}</code></pre>` +
        (definition.expansion === undefined ? "" : `<p class="apiInherited">${spansHtml(resolvesTo(definition.expansion))}</p>`)
      : model.groups.length === 0
        ? '<p class="apiInherited">Declares no props of its own.</p>'
        : model.groups.map((group) => groupHtml(model.name, group, fold)).join("")) +
    model.closing.map((sentence) => `<p class="apiInherited">${spansHtml(sentence)}</p>`).join("") +
    "</div>"
  );
}

/** The sentence under a definition's declaration that names its values. */
const resolvesTo = (expansion: string): Span[] => [text("Resolves to "), code(expansion), text(".")];

/* A definition's preview (.scratch/a11y-and-finish, 07): the app shows it in a
   tooltip on a link to the definition; the prerendered page and the twin
   carry the link alone. At most this many lines - the link leads to the whole. */
const PREVIEW_LINES = 12;

/** What the tooltip on a link to a definition shows: the declaration, or the
    members as an object type, at most twelve lines, the last an ellipsis
    where it is cut. The values beneath stand apart (`expansion`). */
export function previewOf(model: ApiDefinitionModel): string {
  const lines =
    model.declaration !== undefined
      ? model.declaration.map((span) => span.text).join("").split("\n")
      : [
          "{",
          ...model.groups.flatMap((group) =>
            group.rows.map((one) => `  ${one.name}${one.badges.includes("required") ? "" : "?"}: ${one.type.map((span) => span.text).join("")};`),
          ),
          "}",
        ];
  return (lines.length > PREVIEW_LINES ? [...lines.slice(0, PREVIEW_LINES - 1), "…"] : lines).join("\n");
}

/** The heading of the block that defines the types without a table. */
export const DEFINITIONS_TITLE = "Types on this page";

/** Its id - one block a page, so one id serves every page. */
export const DEFINITIONS_ID = "types-on-this-page";

/** A page's API section: its tables, in the order of its outline, then the
    definitions. The app mounts this string; the prerendered page carries it. */
export function apiHtml({ tables, definitions }: ApiSection): string {
  return (
    tables.map((model) => tableHtml(model)).join("") +
    (definitions.length === 0
      ? ""
      : `<div class="apiBlock apiDefinitions"><h3 class="apiTitle" id="${DEFINITIONS_ID}">${DEFINITIONS_TITLE}</h3>${definitions.map((model) => tableHtml(model, 4)).join("")}</div>`)
  );
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

/** Inline code that survives backticks in the text (a template literal type,
    a template literal's body): a fence longer than the longest run inside. */
export function markdownCode(value: string): string {
  /* A span that begins and ends with a space loses one each side (GFM): ` | `
     between two linked names would read `|`. */
  if (!value.includes("`")) return /^ .*[^ ].* $/.test(value) ? `\` ${value} \`` : `\`${value}\``;
  const fence = "`".repeat(Math.max(...(value.match(/`+/g) ?? []).map((run) => run.length)) + 1);
  return `${fence} ${value} ${fence}`;
}

/** One table cell: one line, and a pipe that does not end the cell. */
export function markdownCell(value: string): string {
  return value.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|");
}

/** The pieces written back as the Markdown they were read from. */
export function spansMarkdown(spans: readonly Span[]): string {
  return spans
    .map((span) => {
      if (span.kind === "code") return markdownCode(span.text);
      if (span.kind === "bold") return `**${span.text}**`;
      if (span.kind === "link") return `[${span.text}](${span.href})`;
      if (span.kind === "swatch") return "";
      return span.text;
    })
    .join("");
}

/** One table as Markdown, at the llms text's heading level for a table. */
export function tableMarkdown(model: ApiTableModel | ApiDefinitionModel, level = 5): string {
  const definition = "description" in model ? model : undefined;
  const lines = [`${"#".repeat(level)} ${markdownCode(model.heading)}`, ""];
  if (definition?.from !== undefined) lines.push(`From ${markdownCode(definition.from)}.`, "");
  if (definition !== undefined && definition.description.length > 0) lines.push(spansMarkdown(definition.description), "");
  /* A fence holds no link; the names it uses are defined beside it. */
  if (definition?.declaration !== undefined) {
    lines.push(fencedCode("ts", definition.declaration.map((span) => span.text).join("")));
    if (definition.expansion !== undefined) lines.push("", spansMarkdown(resolvesTo(definition.expansion)));
  }
  else if (model.groups.length === 0) lines.push("Declares no props of its own.");
  model.groups.forEach((group, i) => {
    if (i > 0) lines.push("");
    if (group.title !== undefined) lines.push(`###### ${group.title}`, "");
    lines.push("| Prop | Type | Default | Description |", "|---|---|---|---|");
    for (const one of group.rows) {
      const name = `${markdownCode(one.name)}${one.badges.map((badge) => ` *${badge}*`).join("")}`;
      const origin = one.origin === undefined ? "" : ` From ${markdownCode(one.origin)}.`;
      const deprecated = one.deprecated === undefined ? "" : `*Deprecated* ${spansMarkdown(one.deprecated)} `;
      /* A cell holds one line; `<br>` is how a table cell breaks in GFM. */
      const expansion = one.expansion === undefined ? "" : `<br>${markdownCode(one.expansion)}`;
      const shown = one.shownIn === undefined ? "" : `<br>${spansMarkdown(one.shownIn)}`;
      lines.push(
        `| ${name} | ${markdownCell(typeMarkdown(one.type) + expansion)} | ${one.defaultValue === undefined ? "—" : markdownCell(spansMarkdown(one.defaultValue))} | ${markdownCell(deprecated + spansMarkdown(one.description) + origin + shown)} |`,
      );
    }
  });
  for (const sentence of model.closing) lines.push("", spansMarkdown(sentence));
  return lines.join("\n");
}

/** A type cell as code, a linked name as a link around its own code:
    [`Accessor`](#type-Accessor)`<T>`. */
function typeMarkdown(spans: readonly Span[]): string {
  return spans.map((span) => (span.kind === "link" ? `[${markdownCode(span.text)}](${span.href})` : markdownCode(span.text))).join("");
}

/** A fence longer than any run of backticks inside - a source may hold one. */
export function fencedCode(language: string, value: string): string {
  const longest = Math.max(2, ...(value.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(longest + 1);
  return `${fence}${language}\n${value.replace(/\n+$/, "")}\n${fence}`;
}

/** A page's API section as Markdown: the tables, then the definitions, at
    the llms text's heading levels - each part a block of its own. */
export function apiMarkdown({ tables, definitions }: ApiSection): string[] {
  return [
    ...tables.map((model) => tableMarkdown(model)),
    ...(definitions.length === 0 ? [] : [`##### ${DEFINITIONS_TITLE}`, ...definitions.map((model) => tableMarkdown(model, 6))]),
  ];
}
