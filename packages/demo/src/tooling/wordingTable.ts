/* A wording as a table (.scratch/theming-and-wording-reference, 04): every
   entry of a directory - core's `Wording`, the charts' `ChartsWording`, the
   formats - with its English and its German text side by side.

   Read from the source through the TypeScript parser, never from a list kept
   beside it: the interface gives the keys, their order, their groups and
   their comments, the two objects the texts. A string entry shows its text; a
   function entry its body as written, in code, under its key with the
   interface's parameter names; a nested object stands flattened with dots
   (`presets.today`). A form this does not read throws rather than being
   guessed at.

   It runs in Node (a demo's `props.ts`), which is why the imports carry their
   extensions. */

import ts from "typescript";
import { spansOf, type Span } from "./apiTable.ts";
import type { ReferenceTable } from "./referenceTable.ts";

export interface WordingEntry {
  /** `noMatches`, `presets.today`. */
  key: string;
  /** A function entry's parameter names, as the interface writes them. */
  parameters?: readonly string[];
  /** The section comment above it in the interface. */
  group?: string;
  /** Its JSDoc on one line - a nested entry's own, else its parent's. */
  description?: string;
}

/** A text of an entry: a string as text, anything else as written, in code. */
export type WordingText = Span & { kind: "text" | "code" };

/** A section comment as the sources write them: `/* -------- Inputs ---- *\/`. */
const SECTION = /^\/\*\s*-{2,}\s*(.+?)\s*-{2,}\s*\*\/$/;

const oneLine = (text: string) => text.replace(/\s*\n\s*/g, " ").trim();

function parse(source: string): ts.SourceFile {
  return ts.createSourceFile("wording.ts", source, ts.ScriptTarget.Latest, true);
}

function nameOf(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  throw new Error(`\`${name.getText()}\` is no name the wording reader knows.`);
}

function jsDocOf(node: ts.Node): string | undefined {
  const doc = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
  const text = doc === undefined ? undefined : ts.getTextOfJSDocComment(doc.comment);
  return text === undefined || text.trim() === "" ? undefined : oneLine(text);
}

/** The entries of an interface, in its order. */
export function readEntries(source: string, interfaceName: string): WordingEntry[] {
  const file = parse(source);
  const declaration = file.statements.find((one): one is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(one) && one.name.text === interfaceName);
  if (declaration === undefined) throw new Error(`There is no \`interface ${interfaceName}\` to read.`);
  const entries: WordingEntry[] = [];
  let group: string | undefined;
  const walk = (members: ts.NodeArray<ts.TypeElement>, prefix: string, inherited?: string) => {
    for (const member of members) {
      if (prefix === "") {
        for (const range of ts.getLeadingCommentRanges(source, member.getFullStart()) ?? []) {
          const section = SECTION.exec(source.slice(range.pos, range.end));
          if (section !== null) group = section[1];
        }
      }
      if (!ts.isPropertySignature(member) || member.name === undefined) throw new Error(`\`${member.getText()}\` in \`${interfaceName}\` is no property the wording reader knows.`);
      const key = `${prefix}${nameOf(member.name)}`;
      const description = jsDocOf(member) ?? inherited;
      if (member.type !== undefined && ts.isTypeLiteralNode(member.type)) {
        walk(member.type.members, `${key}.`, description);
        continue;
      }
      entries.push({
        key,
        ...(member.type !== undefined && ts.isFunctionTypeNode(member.type) ? { parameters: member.type.parameters.map((one) => one.name.getText()) } : {}),
        ...(group === undefined ? {} : { group }),
        ...(description === undefined ? {} : { description }),
      });
    }
  };
  walk(declaration.members, "");
  return entries;
}

/** The texts of an object literal, by key. */
export function readTexts(source: string, objectName: string): Map<string, WordingText> {
  const file = parse(source);
  let initializer: ts.Expression | undefined;
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const one of statement.declarationList.declarations) {
      if (ts.isIdentifier(one.name) && one.name.text === objectName) initializer = one.initializer;
    }
  }
  while (initializer !== undefined && (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer) || ts.isParenthesizedExpression(initializer))) initializer = initializer.expression;
  if (initializer === undefined || !ts.isObjectLiteralExpression(initializer)) throw new Error(`\`${objectName}\` is no object literal to read.`);

  const texts = new Map<string, WordingText>();
  const walk = (object: ts.ObjectLiteralExpression, prefix: string) => {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) throw new Error(`\`${property.getText()}\` in \`${objectName}\` is no entry the wording reader knows.`);
      const key = `${prefix}${nameOf(property.name)}`;
      const value = property.initializer;
      if (ts.isObjectLiteralExpression(value)) walk(value, `${key}.`);
      else if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) texts.set(key, { kind: "text", text: value.text });
      else if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) texts.set(key, { kind: "code", text: oneLine(value.body.getText()) });
      else texts.set(key, { kind: "code", text: oneLine(value.getText()) });
    }
  };
  walk(initializer, "");
  return texts;
}

export interface WordingJob {
  title: string;
  /** The section's id, and the prefix of every row's: `wording-<key>`. */
  anchor: string;
  /** The sentence before the table, with marks. */
  lead: string;
  entries: readonly WordingEntry[];
  english: ReadonlyMap<string, WordingText>;
  german: ReadonlyMap<string, WordingText>;
}

/** The table: Key, English, German, Description, grouped as the interface
    groups its entries. */
export function wordingTable({ title, anchor, lead, entries, english, german }: WordingJob): ReferenceTable {
  const groups: { title?: string; rows: ReferenceTable["groups"][number]["rows"][number][] }[] = [];
  for (const entry of entries) {
    const text = (texts: ReadonlyMap<string, WordingText>, language: string): WordingText => {
      const found = texts.get(entry.key);
      if (found === undefined) throw new Error(`\`${entry.key}\` has no ${language} text in the ${title} table.`);
      return found;
    };
    if (groups.length === 0 || groups.at(-1)!.title !== entry.group) groups.push(entry.group === undefined ? { rows: [] } : { title: entry.group, rows: [] });
    groups.at(-1)!.rows.push({
      anchor: `${anchor}-${entry.key}`,
      cells: [
        [{ kind: "code", text: entry.parameters === undefined ? entry.key : `${entry.key}(${entry.parameters.join(", ")})` }],
        [text(english, "English")],
        [text(german, "German")],
        entry.description === undefined ? [{ kind: "text", text: "—" }] : spansOf(entry.description),
      ],
    });
  }
  return {
    title,
    anchor,
    lead: spansOf(lead),
    columns: ["Key", "English", "German", "Description"],
    groups: groups.map(({ title: group, rows }) => (group === undefined ? { rows } : { title: [{ kind: "text", text: group }], rows })),
  };
}
