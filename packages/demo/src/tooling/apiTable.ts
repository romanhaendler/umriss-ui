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
import type { PropEntry, TypeEntry } from "./propsReader.ts";

/** A piece of a written text - the marks a page's texts may carry. */
export type Span =
  | { kind: "text" | "code" | "bold"; text: string }
  | { kind: "link"; text: string; href: string };

export interface ApiRow {
  name: string;
  /** The type cell. One piece today; a later step links the library's types in it. */
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
}

export interface ApiGroup {
  /** Names the table for a screen reader: `props`, `events`, `accessibility`, `styling`. */
  label: string;
  /** A heading above the table - every group but the main one. */
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

function row(prop: PropEntry): ApiRow {
  return {
    name: prop.name,
    type: [text(prop.type)],
    ...(prop.expansion === undefined ? {} : { expansion: prop.expansion }),
    ...(prop.defaultValue === undefined
      ? {}
      : { defaultValue: prop.defaultIsPhrase === true ? spansOf(prop.defaultValue) : [code(prop.defaultValue)] }),
    ...(prop.deprecated === undefined ? {} : { deprecated: spansOf(prop.deprecated) }),
    description: spansOf(prop.description),
    ...(prop.inheritedFrom === undefined ? {} : { origin: prop.inheritedFrom }),
    badges: prop.optional ? [] : ["required"],
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
    Styling - each only where a row falls into it. */
export function tableModel(entry: TypeEntry): ApiTableModel {
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
      const rows = arranged(entry.props.filter((prop) => groupOf(prop.name, names) === group.label)).map(row);
      return rows.length === 0 ? [] : [{ ...group, rows }];
    }),
    closing,
  };
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

/** Pieces as HTML - the writers' one way of writing a text. */
export function spansHtml(spans: readonly Span[]): string {
  return spans
    .map((span) => {
      const inner = escape(span.text);
      if (span.kind === "code") return `<code>${inner}</code>`;
      if (span.kind === "bold") return `<strong>${inner}</strong>`;
      if (span.kind === "link") return `<a href="${escape(hrefOf(span.href))}">${inner}</a>`;
      return inner;
    })
    .join("");
}

function groupHtml(name: string, group: ApiGroup): string {
  const rows = group.rows.map(
    (one) =>
      "<tr>" +
      `<th scope="row"><code>${escape(one.name)}</code>${one.badges.map((badge) => `<span class="apiBadge">${escape(badge)}</span>`).join("")}</th>` +
      `<td><code class="apiType">${spansHtml(one.type)}</code>${one.expansion === undefined ? "" : `<br><code>${escape(one.expansion)}</code>`}</td>` +
      `<td>${one.defaultValue === undefined ? "—" : spansHtml(one.defaultValue)}</td>` +
      `<td>${one.deprecated === undefined ? "" : `<span class="apiDeprecated"><span class="apiBadge">Deprecated</span> ${spansHtml(one.deprecated)}</span> `}${spansHtml(one.description)}${one.origin === undefined ? "" : `<span class="apiOrigin"> from <code>${escape(one.origin)}</code></span>`}</td>` +
      "</tr>",
  );
  return (
    (group.title === undefined ? "" : `<h4 class="apiGroupTitle">${escape(group.title)}</h4>`) +
    `<div class="apiRole"><table class="apiTable" aria-label="${escape(`${name}: ${group.label}`)}">` +
    '<thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead>' +
    `<tbody>${rows.join("")}</tbody></table></div>`
  );
}

/** One table as HTML - no whitespace between the elements, as React writes it. */
export function tableHtml(model: ApiTableModel): string {
  return (
    `<div class="apiBlock" data-type="${escape(model.name)}">` +
    `<h3 class="apiTitle" id="${escape(model.anchor)}"><code>${escape(model.heading)}</code></h3>` +
    (model.groups.length === 0 ? '<p class="apiInherited">Declares no props of its own.</p>' : model.groups.map((group) => groupHtml(model.name, group)).join("")) +
    model.closing.map((sentence) => `<p class="apiInherited">${spansHtml(sentence)}</p>`).join("") +
    "</div>"
  );
}

/** A page's API section: its tables, in the order of its outline. The app
    mounts this string; the prerendered page carries it. */
export function apiHtml(models: readonly ApiTableModel[]): string {
  return models.map(tableHtml).join("");
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

/** Inline code that survives backticks in the text (a template literal type,
    a template literal's body): a fence longer than the longest run inside. */
export function markdownCode(value: string): string {
  if (!value.includes("`")) return `\`${value}\``;
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
      return span.text;
    })
    .join("");
}

/** One table as Markdown, at the llms text's heading level for a table. */
export function tableMarkdown(model: ApiTableModel): string {
  const lines = [`##### ${markdownCode(model.heading)}`, ""];
  if (model.groups.length === 0) lines.push("Declares no props of its own.");
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
      lines.push(
        `| ${name} | ${markdownCell(markdownCode(spansMarkdown(one.type)) + expansion)} | ${one.defaultValue === undefined ? "—" : markdownCell(spansMarkdown(one.defaultValue))} | ${markdownCell(deprecated + spansMarkdown(one.description) + origin)} |`,
      );
    }
  });
  for (const sentence of model.closing) lines.push("", spansMarkdown(sentence));
  return lines.join("\n");
}
