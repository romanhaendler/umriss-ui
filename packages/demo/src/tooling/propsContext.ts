/* What one reading of the source shares: the compiler's checker, the
   declarations by name, the rows' places and what has been found so far.
   `readProps` builds the context; the modules next door read and extend it. */

import ts from "typescript";
import type { Flag, Gap, PropEntry, TypeEntry } from "./propsReader.ts";
import { declarationOf, type Declaration } from "./propsSyntax.ts";

export interface Ctx {
  checker: ts.TypeChecker;
  /** The modules a reader imports from; none, and nothing is checked for export. */
  entries: readonly string[];
  /** What the entries export, re-exports followed to their declaration. */
  importable: Set<ts.Declaration>;
  /** Every name a declaration of the files takes as a type parameter and no
      declaration takes as its own name. */
  parameterNames: Set<string>;
  /** Every type of the library a cell or a declaration names, by the name it
      is declared under - and what that name means, for the definitions. */
  named: Map<string, Declaration>;
  cache: Map<Declaration, TypeEntry>;
  gaps: { of: Declaration; gap: Gap }[];
  flags: { of: Declaration; flag: Flag }[];
  /** "Public" means: stands in some table. */
  isPublic: Set<Declaration>;
  check: (text: string) => readonly string[];
  /** The member an entry is read from - for reporting a gap and checking a
      default, even where the entry ends up as a copy in another table. */
  sources: WeakMap<PropEntry, ts.PropertySignature>;
  /** Every member an entry is read from - more than one where arms or
      branches merge: a use of any of them shows the row. */
  members: WeakMap<PropEntry, readonly ts.PropertySignature[]>;
}

/** The names among these that no entry exports - none where no entries
    are given. */
export const unexported = (ctx: Ctx, names: readonly string[]): string[] =>
  ctx.entries.length === 0 ? [] : names.filter((name) => !ctx.importable.has(ctx.named.get(name)!));

/** The type parameters a written type names and does not bind itself - as
    a generic function or a mapped type inside it does. */
export const parametersNamed = (ctx: Ctx, text: string): string[] => {
  const bound = new Set<string>();
  const named = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isTypeParameterDeclaration(node)) bound.add(node.name.text);
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) named.add(node.typeName.text);
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile("type.ts", `type Read = ${text};`, ts.ScriptTarget.Latest));
  return [...named].filter((name) => ctx.parameterNames.has(name) && !bound.has(name));
};

export const referencesOf = (ctx: Ctx, node: ts.Node): string[] => {
  const found: string[] = [];
  const visit = (child: ts.Node): void => {
    const declaration = ts.isTypeReferenceNode(child) ? declarationOf(ctx.checker, child) : undefined;
    if (declaration !== undefined && !declaration.getSourceFile().fileName.includes("/node_modules/")) {
      const name = declaration.name.text;
      const known = ctx.named.get(name);
      /* One name, one anchor (`#type-<Name>`): two types under it would
         be one link to two places. */
      if (known !== undefined && known !== declaration) {
        throw new Error(`\`${name}\` names two types, in ${known.getSourceFile().fileName} and ${declaration.getSourceFile().fileName}.`);
      }
      ctx.named.set(name, declaration);
      if (!found.includes(name)) found.push(name);
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
};

export const withPlace = (ctx: Ctx, from: PropEntry, to: PropEntry, ...also: readonly PropEntry[]): PropEntry => {
  const source = ctx.sources.get(from);
  if (source !== undefined) ctx.sources.set(to, source);
  ctx.members.set(to, [...new Set([from, ...also].flatMap((one) => ctx.members.get(one) ?? []))]);
  return to;
};

export const placeOf = (member: ts.PropertySignature): { file: string; line: number } => {
  const file = member.getSourceFile();
  return { file: file.fileName, line: file.getLineAndCharacterOfPosition(member.getStart(file)).line + 1 };
};
