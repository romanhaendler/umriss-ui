/* The defaults a component sets while unpacking its props, and their laying
   over a table's rows. */

import ts from "typescript";
import { placeOf, withPlace, type Ctx } from "./propsContext.ts";
import type { PropEntry } from "./propsReader.ts";
import { declarationOf, tagOf, textOf, type Declaration } from "./propsSyntax.ts";

/** Does this function belong to this props type? Checked by the annotation on
    the parameter (`{ … }: TabsProps`), not guessed from the name. */
export const belongsTo = (
  checker: ts.TypeChecker,
  parameter: ts.ParameterDeclaration,
  declaration: Declaration,
): boolean => {
  const type = parameter.type;
  if (type === undefined) return false;
  /* `GlyphProps & { range?: boolean }` is still a function of `GlyphProps`. */
  return (ts.isIntersectionTypeNode(type) ? type.types : [type]).some((part) => declarationOf(checker, part) === declaration);
};

/** The default values a component sets while unpacking its props.

    From there and nowhere else. Inventing a default out of a type - `boolean`
    therefore `false` - would be guessing, and a guessed default in a table is
    worse than an empty column. The props are unpacked in the parameter list
    (`({ size = "md" }: ButtonProps)`) or in the body (`const { height = 300 }
    = props`), and both count. */
export const defaultValues = (ctx: Ctx, declaration: Declaration): { values: Map<string, ts.Expression>; byFunction: Record<string, Record<string, string>> } => {
  const { checker } = ctx;
  const values = new Map<string, ts.Expression>();
  /* Several functions may share one props type (the glyphs): what they set
     differently is no default of the type, and stands per function. */
  const all = new Map<string, Map<string, ts.Expression>>();
  let own = new Map<string, ts.Expression>();
  const take = (pattern: ts.ObjectBindingPattern): void => {
    for (const element of pattern.elements) {
      if (element.initializer === undefined) continue;
      const name = element.propertyName ?? element.name;
      if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
        own.set(name.text, element.initializer);
      }
    }
  };
  /** Every `const { … } = props` in a body, where `props` is that parameter. */
  const takeFromBody = (body: ts.Node, props: ts.Symbol): void => {
    const visit = (node: ts.Node): void => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isObjectBindingPattern(node.name) &&
        node.initializer !== undefined &&
        ts.isIdentifier(node.initializer) &&
        checker.getSymbolAtLocation(node.initializer) === props
      ) {
        take(node.name);
      }
      ts.forEachChild(node, visit);
    };
    visit(body);
  };
  const visit = (node: ts.Node): void => {
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node)) &&
      node.parameters.length > 0
    ) {
      const first = node.parameters[0]!;
      if (belongsTo(checker, first, declaration)) {
        own = new Map();
        if (ts.isObjectBindingPattern(first.name)) take(first.name);
        else if (ts.isIdentifier(first.name) && node.body !== undefined) {
          const props = checker.getSymbolAtLocation(first.name);
          if (props !== undefined) takeFromBody(node.body, props);
        }
        const called = ts.isFunctionDeclaration(node) ? node.name?.text : ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name) ? node.parent.name.text : undefined;
        if (called !== undefined) all.set(called, own);
        for (const [name, value] of own) values.set(name, value);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration.getSourceFile());
  const differs = new Set<string>();
  for (const one of all.values()) {
    for (const [name, value] of one) {
      if (all.size > 1 && [...all.values()].some((other) => textOf(other.get(name) ?? value) !== textOf(value) || !other.has(name))) differs.add(name);
    }
  }
  for (const name of differs) values.delete(name);
  const byFunction: Record<string, Record<string, string>> = {};
  for (const [called, one] of all) {
    const set = [...one].filter(([name]) => differs.has(name)).map(([name, value]) => [name, textOf(value)] as const);
    if (set.length > 0) byFunction[called] = Object.fromEntries(set);
  }
  return { values, byFunction };
};

/** What a constant in the pattern stands for: `DEFAULT_LANE_HEIGHT` is
    `44`, and a tag may say so rather than name what nobody can import. */
export const constantOf = (checker: ts.TypeChecker, node: ts.Expression): string | undefined => {
  if (!ts.isIdentifier(node)) return undefined;
  let symbol = checker.getSymbolAtLocation(node);
  if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol?.valueDeclaration;
  return declaration !== undefined &&
    ts.isVariableDeclaration(declaration) &&
    declaration.initializer !== undefined &&
    (ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const) !== 0
    ? textOf(declaration.initializer)
    : undefined;
};

/** The component's defaults laid over a table's rows - its own members and
    the inherited ones alike, since `XAxis` sets the `id` its parent declares.

    The tag wins, and it may not say what the code does not do: a table
    showing a default the component never sets is worse than an empty
    column. */
export const withDefaults = (ctx: Ctx, props: readonly PropEntry[], defaults: ReadonlyMap<string, ts.Expression>): PropEntry[] =>
  props.map((p) => {
    const pattern = defaults.get(p.name);
    if (pattern === undefined) return p;
    const fromPattern = textOf(pattern);
    const member = ctx.sources.get(p);
    const fromTag = member === undefined ? undefined : tagOf(member, "default");
    if (fromTag === undefined) {
      /* The default stands where `entryOf` puts it, so that the JSON reads
         the same row by row. */
      const head = {
        name: p.name,
        type: p.type,
        ...(p.expansion === undefined ? {} : { expansion: p.expansion }),
        optional: p.optional,
        defaultValue: fromPattern,
      };
      return withPlace(ctx, p, Object.assign(head, p, { defaultValue: fromPattern }));
    }
    if (fromTag !== fromPattern && fromTag !== constantOf(ctx.checker, pattern)) {
      const { file, line } = placeOf(member!);
      throw new Error(
        `${file}:${line}  ${p.name}: \`@default\` says \`${fromTag}\`, the destructuring pattern \`${fromPattern}\`.`,
      );
    }
    return p;
  });
