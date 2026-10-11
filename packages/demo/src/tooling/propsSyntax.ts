/* Reading single nodes of the source: texts, members, references, tags and
   the literals a type comes to. What needs the checker is handed it; nothing
   here keeps state. */

import ts from "typescript";

export type Declaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

export const isExported = (declaration: Declaration): boolean =>
  (ts.getCombinedModifierFlags(declaration) & ts.ModifierFlags.Export) !== 0;

export const textOf = (node: ts.Node): string =>
  node.getText(node.getSourceFile()).replace(/\s+/g, " ").trim();

export const descriptionOf = (checker: ts.TypeChecker, name: ts.Node): string => {
  const symbol = checker.getSymbolAtLocation(name);
  if (symbol === undefined) return "";
  return ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
};

export const propName = (member: ts.PropertySignature): string =>
  ts.isStringLiteral(member.name) || ts.isIdentifier(member.name)
    ? member.name.text
    : member.name.getText(member.getSourceFile());

/** Named props only: methods and index signatures are not. */
export const membersOf = (node: ts.Node): ts.PropertySignature[] => {
  const members = ts.isInterfaceDeclaration(node)
    ? node.members
    : ts.isTypeLiteralNode(node)
      ? node.members
      : undefined;
  return members === undefined ? [] : members.filter(ts.isPropertySignature);
};

/** A reference to a named type, taken apart into name and arguments.

    Two kinds of node mean the same thing and look different: in a type
    position `Omit<X, "a">` stands as a type reference, in an `extends`
    clause as an expression with type arguments. Whoever handles only the
    first never finds an inheritance on an interface. */
export const reference = (
  node: ts.Node,
): { name: string; args: readonly ts.TypeNode[] } | undefined => {
  if (ts.isTypeReferenceNode(node)) {
    const name = ts.isIdentifier(node.typeName)
      ? node.typeName.text
      : node.typeName.right.text;
    return { name, args: node.typeArguments ?? [] };
  }
  if (ts.isExpressionWithTypeArguments(node)) {
    const expression = node.expression;
    const name = ts.isIdentifier(expression)
      ? expression.text
      : ts.isPropertyAccessExpression(expression)
        ? expression.name.text
        : undefined;
    return name === undefined ? undefined : { name, args: node.typeArguments ?? [] };
  }
  return undefined;
};

/** The name of a type reference without its arguments: `Foo<T>` -> `Foo`. */
export const rootName = (type: ts.Node): string | undefined => reference(type)?.name;

/** The declaration a reference means, in these files - through the
    checker's symbol and any import, not by its name. */
export const declarationOf = (checker: ts.TypeChecker, node: ts.Node): Declaration | undefined => {
  const at = ts.isTypeReferenceNode(node)
    ? ts.isIdentifier(node.typeName) ? node.typeName : node.typeName.right
    : ts.isExpressionWithTypeArguments(node)
      ? ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression
      : undefined;
  let symbol = at === undefined ? undefined : checker.getSymbolAtLocation(at);
  if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.declarations?.find(
    (d): d is Declaration =>
      (ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d)) && !d.getSourceFile().isDeclarationFile,
  );
};

/** A helper type's type parameters replaced by the arguments at its use -
    over identifiers, not over substrings. */
export const substitute = (text: string, substitutions: ReadonlyMap<string, string>): string =>
  substitutions.size === 0 ? text : text.replace(/[A-Za-z_$][\w$]*/g, (identifier) => substitutions.get(identifier) ?? identifier);

/** A member's tag, its text on one line; `undefined` where it has none. Of
    all tags only `@default` and `@deprecated` are read - `@remarks`,
    `@since` and the rest are dropped with the description they are not part
    of. */
export const tagOf = (member: ts.PropertySignature, name: string): string | undefined => {
  const tag = ts.getJSDocTags(member).find((t) => t.tagName.text === name);
  return tag === undefined ? undefined : (ts.getTextOfJSDocComment(tag.comment) ?? "").replace(/\s+/g, " ").trim();
};

/** Does a default read as code: a literal, an identifier or a property
    access? Everything else is a phrase. */
export const isValue = (text: string): boolean => {
  const statement = ts.createSourceFile("default.ts", `(${text});`, ts.ScriptTarget.Latest).statements;
  if (statement.length !== 1 || !ts.isExpressionStatement(statement[0]!)) return false;
  const wrapped = statement[0].expression;
  /* The parenthesis closes right behind the text, or the text was more than
     one expression. */
  if (!ts.isParenthesizedExpression(wrapped) || wrapped.end !== text.length + 2) return false;
  const inner = wrapped.expression;
  const accessed = (node: ts.Expression): boolean =>
    ts.isIdentifier(node) || (ts.isPropertyAccessExpression(node) && accessed(node.expression));
  return (
    ts.isLiteralExpression(inner) ||
    [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(inner.kind) ||
    (ts.isPrefixUnaryExpression(inner) && ts.isNumericLiteral(inner.operand)) ||
    ts.isArrayLiteralExpression(inner) ||
    ts.isObjectLiteralExpression(inner) ||
    accessed(inner)
  );
};

/** What a helper's type parameters stand for at one use: the arguments
    given there, or the defaults - themselves in the arguments before them. */
export const substitutionsOf = (declaration: Declaration, args: readonly ts.TypeNode[]): Map<string, string> => {
  const substitutions = new Map<string, string>();
  (declaration.typeParameters ?? []).forEach((parameter, i) => {
    const argument = args[i];
    if (argument !== undefined) substitutions.set(parameter.name.text, textOf(argument));
    else if (parameter.default !== undefined) {
      substitutions.set(parameter.name.text, substitute(textOf(parameter.default), substitutions));
    }
  });
  return substitutions;
};

/** The type alias of the library a reference names, through an import:
    declared in the source read, not in a `.d.ts`. */
export const aliasOf = (checker: ts.TypeChecker, node: ts.TypeReferenceNode): ts.TypeAliasDeclaration | undefined => {
  let symbol = checker.getSymbolAtLocation(node.typeName);
  if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
  return declaration === undefined || declaration.getSourceFile().isDeclarationFile ? undefined : declaration;
};

/** The literals a type comes to over any number of alias hops, in the order
    they are written; `undefined` where any part is no string, number or
    boolean literal. */
export const literalsOf = (checker: ts.TypeChecker, node: ts.TypeNode, depth: number): string[] | undefined => {
  /* A chain this long is a cycle, not a list. */
  if (depth > 8) return undefined;
  if (ts.isParenthesizedTypeNode(node)) return literalsOf(checker, node.type, depth);
  if (ts.isLiteralTypeNode(node)) return node.literal.kind === ts.SyntaxKind.NullKeyword ? undefined : [textOf(node)];
  if (ts.isUnionTypeNode(node)) {
    const parts = node.types.map((part) => literalsOf(checker, part, depth));
    return parts.every((part) => part !== undefined) ? parts.flat() : undefined;
  }
  const alias = ts.isTypeReferenceNode(node) ? aliasOf(checker, node) : undefined;
  return alias === undefined ? undefined : literalsOf(checker, alias.type, depth + 1);
};

/** A type cell's values beneath its name: only where the cell is one named
    alias (or an array of one) - an inline union shows its values already,
    and an interface, a function or a mixed union is no list. */
export const expansionOf = (checker: ts.TypeChecker, node: ts.TypeNode): string | undefined => {
  const named = ts.isArrayTypeNode(node) ? node.elementType : node;
  if (!ts.isTypeReferenceNode(named) || aliasOf(checker, named) === undefined) return undefined;
  const literals = literalsOf(checker, named, 0);
  return literals === undefined ? undefined : [...new Set(literals)].join(" | ");
};

/** The names an `Omit<…, "a" | "b">` takes out. */
export const omittedNames = (type: ts.TypeNode): string[] => {
  const names: string[] = [];
  const collect = (node: ts.TypeNode): void => {
    if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
      names.push(node.literal.text);
    } else if (ts.isUnionTypeNode(node)) {
      for (const part of node.types) collect(part);
    }
  };
  collect(type);
  return names;
};
