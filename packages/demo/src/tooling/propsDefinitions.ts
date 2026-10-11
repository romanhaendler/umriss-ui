/* The definitions pass of `readProps`: every type a table names and no table
   is, then every type those name, in the order they are first named - read as
   a members table, or kept as the declaration was written. Also the two flags
   that belong to a declaration as a whole. State stands in the `Ctx`. */

import ts from "typescript";
import { referencesOf, unexported, type Ctx } from "./propsContext.ts";
import { readType } from "./propsInherit.ts";
import { descriptionOf, expansionOf, textOf, type Declaration } from "./propsSyntax.ts";
import type { Flag, TypeEntry } from "./propsReader.ts";

/** A flag that belongs to a declaration as a whole: its comment, its
    header, its declaration as written. */
export const flagAt = (ctx: Ctx, declaration: Declaration, kind: Flag["kind"], prop: string, found: readonly string[]): void => {
  if (found.length === 0) return;
  const file = declaration.getSourceFile();
  const line = file.getLineAndCharacterOfPosition(declaration.getStart(file)).line + 1;
  ctx.flags.push({ of: declaration, flag: { kind, type: declaration.name.text, prop, file: file.fileName, line, found } });
};

/** The names a header shows that no entry exports: a table's own, and what
    its parameters' constraints and defaults name. */
export const flagHeader = (ctx: Ctx, declaration: Declaration, table: boolean): void => {
  const own = table && ctx.entries.length > 0 && !ctx.importable.has(declaration) ? [declaration.name.text] : [];
  const constraints = [...new Set((declaration.typeParameters ?? []).flatMap((t) => referencesOf(ctx, t)))];
  flagAt(ctx, declaration, "unexported", "(its header)", [...own, ...unexported(ctx, constraints)]);
};

const packageOf = (fileName: string): string | undefined => {
  for (let dir = fileName.slice(0, fileName.lastIndexOf("/")); dir.includes("/"); dir = dir.slice(0, dir.lastIndexOf("/"))) {
    const manifest = ts.sys.readFile(`${dir}/package.json`);
    if (manifest !== undefined) return (JSON.parse(manifest) as { name?: string }).name;
  }
  return undefined;
};

/** Does the type read as a table - nothing but named members? */
const hasMembers = (declaration: Declaration): boolean => {
  const members = ts.isInterfaceDeclaration(declaration)
    ? declaration.members
    : ts.isTypeLiteralNode(declaration.type)
      ? declaration.type.members
      : undefined;
  return members !== undefined && members.every(ts.isPropertySignature);
};

/** Adds the definitions to `types`. `declarations` are the types by name,
    `own` the files of the package read, `alsoDefine` what the API index names
    besides. A type with a table is linked, not defined again. Returns what a
    page shows: the tables, and the definitions. */
export function defineReferenced(
  ctx: Ctx,
  types: Record<string, TypeEntry>,
  typeNames: readonly string[],
  declarations: ReadonlyMap<string, Declaration>,
  own: ReadonlySet<string>,
  alsoDefine: readonly string[],
): Set<Declaration> {
  const { named, checker, check } = ctx;
  const queue = Object.values(types).flatMap((entry) => entry.props.flatMap((p) => p.references ?? []));
  /* What the API index names besides (ADR-0044): an exported type, a type a
     hook's or a function's signature names - by name, as the index links it.
     A name the package does not declare (`ReactNode`) is no type of it. */
  for (const name of alsoDefine) {
    const declaration = declarations.get(name);
    if (declaration === undefined || (named.get(name) ?? declaration) !== declaration) continue;
    named.set(name, declaration);
    queue.push(name);
  }
  const shown = new Set<Declaration>(ctx.isPublic);
  for (let i = 0; i < queue.length; i++) {
    const name = queue[i]!;
    const declaration = named.get(name)!;
    if (typeNames.includes(name) && declarations.get(name) !== declaration) {
      throw new Error(`\`${name}\` names two types: a table's and the one in ${declaration.getSourceFile().fileName}.`);
    }
    if (types[name] !== undefined) continue;
    const fileName = declaration.getSourceFile().fileName;
    const from = own.has(fileName) ? undefined : packageOf(fileName);
    const description = descriptionOf(checker, declaration.name);
    const parameter = (declaration.typeParameters ?? []).map(textOf);
    /* A definition stands on a page: its texts are a reader's, like a row's. */
    shown.add(declaration);
    flagAt(ctx, declaration, "reference", "(its comment)", check(description));
    if (hasMembers(declaration)) {
      flagHeader(ctx, declaration, false);
      const entry = readType(ctx, declaration);
      types[name] = { ...entry, definition: { description, ...(from === undefined ? {} : { from }) } };
      queue.push(...entry.props.flatMap((p) => p.references ?? []));
    } else {
      const references = referencesOf(ctx, declaration);
      flagAt(ctx, declaration, "unexported", "(its declaration)", unexported(ctx, references));
      const text = declaration.getText().replace(/^export /, "").replace(/^declare /, "");
      /* `type ButtonSize = ControlSize` says nothing of its values; a literal
         union written out here says them already, and `expansionOf` leaves it. */
      const expansion = ts.isTypeAliasDeclaration(declaration) ? expansionOf(checker, declaration.type) : undefined;
      types[name] = {
        name,
        parameter,
        omitted: [],
        props: [],
        definition: {
          description,
          ...(from === undefined ? {} : { from }),
          declaration: text,
          ...(references.length === 0 ? {} : { references }),
          ...(expansion === undefined ? {} : { expansion }),
        },
      };
      queue.push(...references);
    }
  }
  return shown;
}
