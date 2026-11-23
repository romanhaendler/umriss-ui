/* `API.md`: the small place to look up what a package exports (checked in, one
   per library package, written by the `props` step; a stale one fails
   `pnpm check:site`).

   Every export with the first sentence of its JSDoc, and for every component
   and hook the props, options and returns the same way. The full text stands in
   `docs/llms-full.md`; this file is what one reads before saying what a package
   can or cannot do. Pure: the same input gives the same bytes - no dates, no
   paths. */

import ts from "typescript";
import type { ExportedDeclaration } from "./exportDocs.ts";
import type { PropEntry, TypeEntry } from "./propsReader.ts";

/** The group an export is listed in: a class is a constant to the checker, a
    class to the reader. */
const groupOf = (one: ExportedDeclaration): string =>
  one.kind === "constant" && /^(export )?(declare )?(abstract )?class\b/.test(one.declaration) ? "class" : one.kind;

const GROUPS = [
  ["component", "Components"],
  ["hook", "Hooks"],
  ["function", "Functions"],
  ["constant", "Constants"],
  ["class", "Classes"],
  ["type", "Types"],
] as const;

const flat = (text: string) => text.replace(/\s+/g, " ").trim();

/** The text up to the first full stop that is followed by a space or the end. */
export function firstSentence(text: string): string {
  const one = flat(text);
  const end = /[.!?](?=\s|$)/.exec(one.replace(/\b(e\.g|i\.e|etc|vs)\./g, (m) => m.replace(/\./g, "\0")));
  return (end === null ? one : one.slice(0, end.index + 1)).replace(/\0/g, ".");
}

const byName = (a: { name: string }, b: { name: string }) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/** The types a parameter list and a return type name: what a component or a
    hook takes and gives. */
function signatureTypes(declaration: string): { takes: string[]; gives: string[] } {
  const file = ts.createSourceFile("declaration.d.ts", declaration, ts.ScriptTarget.Latest, true);
  const names = (node: ts.Node | undefined): string[] => {
    const found: string[] = [];
    const visit = (child: ts.Node): void => {
      if (ts.isTypeReferenceNode(child) && ts.isIdentifier(child.typeName) && !found.includes(child.typeName.text)) found.push(child.typeName.text);
      ts.forEachChild(child, visit);
    };
    if (node !== undefined) visit(node);
    return found;
  };
  const takes: string[] = [];
  const gives: string[] = [];
  const signature = (parameters: readonly ts.ParameterDeclaration[], result: ts.TypeNode | undefined) => {
    for (const one of parameters) takes.push(...names(one.type));
    gives.push(...names(result));
  };
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement)) signature(statement.parameters, statement.type);
    else if (ts.isVariableStatement(statement)) {
      for (const one of statement.declarationList.declarations) {
        const type = one.type;
        if (type !== undefined && ts.isFunctionTypeNode(type)) signature(type.parameters, type.type);
        else takes.push(...names(type));
      }
    }
  }
  return { takes, gives };
}

/** A type longer than a line is cut: the wording's groups are whole objects. */
const short = (type: string) => {
  if (flat(type).length <= 80) return flat(type);
  /* A union of function types is the member's whole signature: the forms are the point. */
  const union = (ts.createSourceFile("type.ts", `type T = ${type};`, ts.ScriptTarget.Latest, true).statements[0] as ts.TypeAliasDeclaration).type;
  const forms = ts.isUnionTypeNode(union) ? union.types.map((one) => (ts.isParenthesizedTypeNode(one) ? one.type : one)) : [];
  return forms.length > 0 && forms.every(ts.isFunctionTypeNode) ? flat(type) : `${flat(type).slice(0, 79)}…`;
};

/** The members of a union alias as they are written: literals as such, named
    types by name, an object by its fields (a literal field with its value). */
function unionMembers(declaration: string): string | undefined {
  const alias = ts.createSourceFile("type.ts", declaration, ts.ScriptTarget.Latest, true).statements[0];
  if (alias === undefined || !ts.isTypeAliasDeclaration(alias) || !ts.isUnionTypeNode(alias.type)) return undefined;
  const one = (type: ts.TypeNode): string =>
    ts.isParenthesizedTypeNode(type) ? one(type.type)
    : ts.isTypeReferenceNode(type) ? type.typeName.getText()
    : ts.isTypeLiteralNode(type) ? `{ ${type.members.map((member) => `${member.name?.getText() ?? ""}${ts.isPropertySignature(member) && member.type !== undefined && ts.isLiteralTypeNode(member.type) ? `: ${member.type.getText()}` : ""}`).join(", ")} }`
    : flat(type.getText());
  return alias.type.types.map(one).join(" | ");
}

/** A method's function type as a method is written: `<R>(a: A): R`. */
function asMethod(type: string): string {
  const alias = ts.createSourceFile("type.ts", `type T = ${type};`, ts.ScriptTarget.Latest, true).statements[0] as ts.TypeAliasDeclaration;
  const fn = alias.type as ts.FunctionTypeNode;
  const generics = fn.typeParameters === undefined ? "" : `<${fn.typeParameters.map((one) => flat(one.getText())).join(", ")}>`;
  return `${generics}(${fn.parameters.map((one) => flat(one.getText())).join(", ")}): ${flat(fn.type.getText())}`;
}

/** A member as it is written: `name?: type`, a method `name(parameters): result`. */
const written = (prop: PropEntry) =>
  `${prop.name}${prop.optional ? "?" : ""}${prop.method === true ? asMethod(prop.type) : `: ${short(prop.type)}`}`;

function rows(props: readonly PropEntry[], own: Readonly<Record<string, string>> = {}): string[] {
  /* A deprecated member stands last, source order otherwise. */
  const ordered = [...props.filter((prop) => prop.deprecated === undefined), ...props.filter((prop) => prop.deprecated !== undefined)];
  return ordered.map((found) => {
    const prop = own[found.name] === undefined ? found : { ...found, defaultValue: own[found.name]! };
    const sentence = firstSentence(prop.description);
    return (
      `- ${written(prop)}` +
      (sentence === "" ? "" : ` — ${sentence}`) +
      (prop.deprecated === undefined ? "" : " (deprecated)") +
      (prop.experimental === undefined ? "" : " (experimental)") +
      (prop.defaultValue === undefined ? "" : ` (default: ${flat(prop.defaultValue)})`)
    );
  });
}

/** A declaration as it is written after its keywords: `f<T>(a: A, b?: B): R`. */
const bare = (node: ts.Node) => flat(node.getText()).replace(/^(export )?(declare )?(function |const |let |var )/, "").replace(/;$/, "");

/** What an export's declaration says of its use, one entry per line after the
    name: a function's signatures, a class's constructor and public members,
    a constant's type where it is short. */
function usage(one: ExportedDeclaration): { head: string; below: string[] } {
  const statements = ts.createSourceFile("d.ts", one.declaration, ts.ScriptTarget.Latest, true).statements;
  if (one.kind === "function") {
    const signatures = statements.filter(ts.isFunctionDeclaration).map(bare);
    const typed = statements.filter(ts.isVariableStatement).map(bare);
    const all = signatures.length > 0 ? signatures : typed;
    if (all.length === 1) return { head: all[0]!.replace(/^(\w+): /, "$1"), below: [] };
    return { head: one.name, below: all };
  }
  if (one.kind === "constant") {
    const klass = statements.find(ts.isClassDeclaration);
    if (klass !== undefined) {
      const open = (member: ts.ClassElement) => !(ts.getCombinedModifierFlags(member as ts.Declaration) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) && !ts.isIndexSignatureDeclaration(member);
      return { head: one.name, below: klass.members.filter(open).map(bare) };
    }
    const type = statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations).find((one) => one.type !== undefined)?.type;
    return { head: type === undefined || flat(type.getText()).length > 80 ? one.name : `${one.name}: ${flat(type.getText())}`, below: [] };
  }
  return { head: one.name, below: [] };
}

export interface ApiMdJob {
  packageName: string;
  exports: readonly ExportedDeclaration[];
  /** The generated tables (`props.json`). */
  entries: Readonly<Record<string, TypeEntry>>;
}

export function apiMd({ packageName, exports, entries }: ApiMdJob): string {
  const out = [`# ${packageName} API`, "", "Generated by the props step (`pnpm --filter " + packageName + " props`); do not edit. Lists every export, and the props, options and returns of each component and hook, with first sentences only; the full text is `docs/llms-full.md`. What stands under `## Experimental`, or is marked `(experimental)`, may change in a minor release; everything else is the surface a break costs a major for (ADR-0083).", ""];
  const line = (one: ExportedDeclaration) => {
    const sentence = firstSentence(one.description);
    /* A type's members by name, so that "does it take X" finds an answer; the
       props types of components stand in full below. */
    const members = one.kind === "type" && !one.name.endsWith("Props") ? (entries[one.name]?.props ?? []).map((prop) => (prop.method === true ? written(prop) : prop.name)) : [];
    const values = one.kind === "type" ? unionMembers(one.declaration) : undefined;
    const { head, below } = usage(one);
    return `- ${head}${sentence === "" ? "" : ` — ${sentence}`}${values === undefined ? "" : ` = ${values}`}${members.length === 0 || members.length > 100 ? "" : ` [${members.join(", ")}]`}${below.map((text) => `\n  - ${text}`).join("")}`;
  };
  const subpaths = [...new Set(exports.flatMap((one) => (one.subpath === undefined ? [] : [one.subpath])))];
  const stable = exports.filter((one) => one.experimental === undefined);
  const sections = [
    ...GROUPS.map(([kind, title]) => ({ title, list: stable.filter((one) => one.subpath === undefined && groupOf(one) === kind) })),
    ...subpaths.map((subpath) => ({ title: `${packageName}/${subpath}`, list: stable.filter((one) => one.subpath === subpath) })),
  ].filter((section) => section.list.length > 0);
  for (const { title, list } of sections) out.push(`## ${title}`, "", ...[...list].sort(byName).map(line), "");
  /* A type with members that is no props type: each member with its type and
     optional mark. The wording's hundreds of labels are counted, not listed. */
  const full = (name: string) => {
    const entry = entries[name];
    if (entry === undefined || entry.props.length === 0) return;
    out.push(`### ${name}`, "", ...(entry.props.length > 100 ? [`${entry.props.length} members; see \`docs/llms-full.md\`.`] : rows(entry.props)), "");
  };
  /* What may change in a minor: marked exports, and marked members as `Type.member`. */
  const experimental = [
    ...exports.filter((one) => one.experimental !== undefined).map((one) => ({ name: one.name, text: line(one) })),
    ...Object.values(entries).flatMap((entry) => entry.props.filter((prop) => prop.experimental !== undefined).map((prop) => ({ name: `${entry.name}.${prop.name}`, text: `- ${entry.name}.${prop.name}${firstSentence(prop.description) === "" ? "" : ` — ${firstSentence(prop.description)}`}` }))),
  ].sort(byName);
  if (experimental.length > 0) {
    out.push("## Experimental", "", ...experimental.map((one) => one.text), "");
    for (const one of exports.filter((one) => one.experimental !== undefined && one.kind === "type" && !one.name.endsWith("Props"))) full(one.name);
  }
  /* The props type a component's type is a function of: a function type, a
     `typeof Name` (its props are `NameProps`), a named type whose declaration is one, or an interface
     of call signatures (the last stands for the rest). Only where the one
     parameter is named types - `A & B` included - and one has a table. */
  const propsOf = (type: string, depth = 0): string | PropEntry[] | undefined => {
    if (depth > 4) return undefined;
    const source = /^(type|interface)\s/.test(type) ? type : `type T = ${type};`;
    const statement = ts.createSourceFile("type.ts", source, ts.ScriptTarget.Latest, true).statements[0];
    const node = statement !== undefined && ts.isTypeAliasDeclaration(statement) ? statement.type : undefined;
    const hasTable = (name: string) => (entries[name]?.props.length ?? 0) > 0;
    let calls: readonly ts.SignatureDeclaration[] = [];
    if (statement !== undefined && ts.isInterfaceDeclaration(statement)) calls = statement.members.filter(ts.isCallSignatureDeclaration);
    else if (node !== undefined && ts.isFunctionTypeNode(node)) calls = [node];
    else if (node !== undefined && ts.isTypeQueryNode(node)) {
      const props = `${node.exprName.getText()}Props`;
      return hasTable(props) ? props : undefined;
    } else if (node !== undefined && ts.isTypeReferenceNode(node)) {
      const declaration = entries[node.typeName.getText()]?.definition?.declaration;
      return declaration === undefined ? undefined : propsOf(declaration, depth + 1);
    }
    /* A component renders: a function that gives something else back is a setter. */
    if (calls.length === 0 || calls.some((call) => call.type === undefined || call.type.getText().replace(/ReactNode|ReactElement|JSX\.Element|null|[\s|]/g, "") !== "")) return undefined;
    const partsOf = (call: ts.SignatureDeclaration): readonly ts.TypeNode[] => {
      const parameter = call.parameters[0]?.type;
      return parameter === undefined ? [] : ts.isIntersectionTypeNode(parameter) ? parameter.types : [parameter];
    };
    const last = partsOf(calls.at(-1)!);
    const named = last.filter((part): part is ts.TypeReferenceNode => ts.isTypeReferenceNode(part));
    if (calls.length === 1 && last.length > 0 && named.length === last.length) return named.map((part) => part.typeName.getText()).find(hasTable);
    /* A named type's members and those of the tables it is also made of. */
    const withAlso = (name: string): readonly PropEntry[] => [...(entries[name]?.props ?? []), ...(entries[name]?.alsoTakes ?? []).flatMap(withAlso)];
    /* Inline objects or several forms: every member of every form, once by name. */
    const merged = new Map<string, PropEntry>();
    for (const part of calls.flatMap(partsOf)) {
      const found: readonly PropEntry[] = ts.isTypeLiteralNode(part)
        ? part.members.filter(ts.isPropertySignature).map((member) => ({
            name: member.name.getText(),
            type: member.type === undefined ? "unknown" : flat(member.type.getText()),
            optional: member.questionToken !== undefined,
            description: ts.getJSDocCommentsAndTags(member).filter(ts.isJSDoc).map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? "").join(" "),
          }))
        : ts.isTypeReferenceNode(part) ? withAlso(part.typeName.getText()) : [];
      for (const one of found) if (!merged.has(one.name)) merged.set(one.name, one);
    }
    return merged.size === 0 ? undefined : [...merged.values()];
  };

  /* Props, options and returns. A type with no members of its own is no table. */
  const tabled = new Set<string>();
  const table = (heading: string, names: readonly string[], owner = "") => {
    for (const name of new Set(names)) {
      const entry = entries[name];
      if (entry === undefined || entry.props.length === 0) continue;
      tabled.add(name);
      /* The wording is a table of hundreds of labels: counted, not listed. */
      out.push(`#### ${heading} (${name})`, "", ...(entry.props.length > 100 ? [`${entry.props.length} members; see \`docs/llms-full.md\`.`] : rows(entry.props, entry.defaultsBy?.[owner])), "");
    }
  };
  for (const kind of ["component", "hook"] as const) {
    const list = exports.filter((one) => one.kind === kind && one.subpath === undefined).sort(byName);
    if (list.length === 0) continue;
    out.push(`## ${kind === "component" ? "Props" : "Options and returns"}`, "");
    for (const one of list) {
      const { takes, gives } = signatureTypes(one.declaration);
      const before = out.length;
      out.push(`### ${one.name}`, "");
      const mark = out.length;
      table(kind === "component" ? "props" : "options", [...takes, ...(kind === "component" ? [`${one.name}Props`] : [])], one.name);
      if (kind === "hook") {
        table("returns", gives);
        /* The components a hook hands back: their props stand here, where a
           caller looks for them. */
        for (const name of new Set(gives)) {
          for (const prop of entries[name]?.props ?? []) {
            const props = propsOf(prop.type);
            if (typeof props === "string") table(`props of ${prop.name}`, [props], prop.name);
            else if (props !== undefined) out.push(`#### props of ${prop.name} (all forms)`, "", ...rows(props), "");
          }
        }
        if (out.length === mark) {
          const type = ts.createSourceFile("d.ts", one.declaration, ts.ScriptTarget.Latest, true).statements.map((s) => s.getText()).join(" ");
          out.push(`\`${flat(type)}\``, "");
        }
      }
      if (out.length === mark) out.splice(before, out.length - before);
    }
  }
  /* A props type no component or hook reaches is tabled all the same; one
     with no entry at all cannot be, and that stops the writer. */
  const open = exports.filter((one) => one.kind === "type" && one.name.endsWith("Props")).map((one) => one.name);
  const missing = open.filter((name) => entries[name] === undefined);
  if (missing.length > 0) throw new Error(`${missing.map((name) => `\`${name}\``).join(", ")} exported with no table - did \`pnpm props\` run?`);
  const rest = open.filter((name) => !tabled.has(name));
  if (rest.some((name) => entries[name]!.props.length > 0)) {
    out.push("## Other props", "");
    table("props", rest);
  }
  const records = exports.filter((one) => one.kind === "type" && !one.name.endsWith("Props") && !tabled.has(one.name) && (entries[one.name]?.props.length ?? 0) > 0).sort(byName);
  const standing = records.filter((one) => one.experimental === undefined);
  if (standing.length > 0) {
    out.push("## Types in full", "");
    for (const one of standing) full(one.name);
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
