/* Reading props tables out of the source.

   The reader knows nothing of the demo, nothing of the outline and nothing of
   where its output is to go: it is handed files and type names and gives back
   entries. The gate, the JSON file and the page layout stand next door in
   `props.ts` - which is what lets this be checked against a handful of fixture
   files rather than against half the library.

   Why by hand against the compiler API and not with a finished docgen. Three
   behaviours decide it, and all three would have to be written on top of a
   finished tool anyway:

   1. Inherited DOM props collapse. `ButtonProps extends
      ButtonHTMLAttributes<HTMLButtonElement>` must not come to two hundred and
      fifty rows. The table shows what the library itself explains and closes
      with one sentence about the rest. What a type of THIS library contributes
      does not collapse: it is a prop of the component like any other and
      stands with a note saying where it comes from.

   2. Generic components stay generic. `Table<T>` shows `T` as `T`. Whoever
      reads `Column<T>[]` learns the shape; whoever reads `Column<unknown>[]`
      learns nothing. That follows by itself, because the type is copied from
      the source and not normalised by the checker.

   3. A prop without JSDoc is reported. Whether that breaks the build is for
      `props.ts` to decide; here it is only established.

   The type stands as it was written, and beside it what it resolves to.
   `"primary" | "secondary" | "ghost" | "danger"` is what the reader needs; the
   resolved form of a mapped type is unreadable. So a named alias that comes to
   a list of literals keeps its name - whoever types a wrapper imports
   `ButtonVariant` - and carries the list as well; nothing else is resolved. */

import ts from "typescript";

export interface PropEntry {
  name: string;
  /** The type, exactly as it stands in the source. */
  type: string;
  /** Where the type is one named alias of the library (or an array of one)
      that comes to literals only: its values, `"sm" | "md"` for `ButtonSize`. */
  expansion?: string;
  optional: boolean;
  /** Out of the `@default` tag, else out of the component's destructuring
      pattern, where there is one. */
  defaultValue?: string;
  /** Set where the default is a phrase and no value: "the size of a
      `ControlSizeProvider`, else `md`" stands as prose, not as code. */
  defaultIsPhrase?: true;
  /** The `@deprecated` tag's sentence; set, even empty, where the prop is. */
  deprecated?: string;
  description: string;
  /** Set where the prop comes from another type of THIS library. */
  inheritedFrom?: string;
}

export interface TypeEntry {
  name: string;
  /** The type parameters as they stand, with constraint and default:
      `["T"]`, `["Z", "K extends Field<Z>"]`. */
  parameter: readonly string[];
  /** What the closing sentence names, where React is inherited from: `"<button>"`. */
  inherits?: string;
  /** Names the inheritance's `Omit` took out. */
  omitted: readonly string[];
  props: readonly PropEntry[];
  /** Types of THIS library the type is also made of and which have a table of
      their own - named rather than copied out. */
  alsoTakes?: readonly string[];
}

export interface Gap {
  type: string;
  prop: string;
  /** An absolute path; whoever wants it shortened knows better against what. */
  file: string;
  line: number;
}

export interface Reading {
  types: Record<string, TypeEntry>;
  gaps: readonly Gap[];
}

/* ------------------------------------------------------------------ */
/* What React declares for an element - and what it is called          */
/* ------------------------------------------------------------------ */

/* By hand, and that is deliberate: the list is short enough to read, and
   every line in it decides how a table's closing sentence reads. `null` means:
   the element stands in the type argument. */
const ATTRIBUTE_TYPES: Readonly<Record<string, string | null>> = {
  HTMLAttributes: null,
  AllHTMLAttributes: null,
  ButtonHTMLAttributes: "<button>",
  InputHTMLAttributes: "<input>",
  SelectHTMLAttributes: "<select>",
  TextareaHTMLAttributes: "<textarea>",
  AnchorHTMLAttributes: "<a>",
  DialogHTMLAttributes: "<dialog>",
  TdHTMLAttributes: "<td>",
  ThHTMLAttributes: "<th>",
  TableHTMLAttributes: "<table>",
  SVGAttributes: null,
  SVGProps: null,
};

const ELEMENT_TYPES: Readonly<Record<string, string>> = {
  HTMLElement: "the rendered element",
  HTMLDivElement: "<div>",
  HTMLSpanElement: "<span>",
  HTMLButtonElement: "<button>",
  HTMLInputElement: "<input>",
  HTMLAnchorElement: "<a>",
  HTMLDialogElement: "<dialog>",
  HTMLHeadingElement: "the heading",
  HTMLTableElement: "<table>",
  HTMLTableRowElement: "<tr>",
  HTMLTableCellElement: "the cell",
  HTMLTableSectionElement: "<tbody>",
  HTMLParagraphElement: "<p>",
  SVGSVGElement: "<svg>",
};

/** Polymorphic: which element is rendered is settled only at the call. */
const POLYMORPH = "the chosen element";

const UNKNOWN_ELEMENT = "the rendered element";

type Declaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

/** Reads the named types out of the named files.

    `files` are absolute paths. The order of the output follows `typeNames`, so
    that two runs produce the same file. */
export function readProps(files: readonly string[], typeNames: readonly string[]): Reading {
  const program = ts.createProgram([...files], {
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();

  const declarations = new Map<string, Declaration>();
  for (const file of program.getSourceFiles()) {
    if (file.isDeclarationFile) continue;
    ts.forEachChild(file, (node) => {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        declarations.set(node.name.text, node);
      }
    });
  }

  /* Every name a declaration of these files takes as a type parameter and no
     declaration takes as its own name: what a free parameter in a table would
     be called. */
  const parameterNames = new Set<string>();
  const collectParameters = (node: ts.Node): void => {
    if (ts.isTypeParameterDeclaration(node) && !declarations.has(node.name.text)) parameterNames.add(node.name.text);
    ts.forEachChild(node, collectParameters);
  };
  for (const file of program.getSourceFiles()) if (!file.isDeclarationFile) collectParameters(file);

  /** The type parameters a written type names and does not bind itself - as
      a generic function or a mapped type inside it does. */
  const parametersNamed = (text: string): string[] => {
    const bound = new Set<string>();
    const named = new Set<string>();
    const visit = (node: ts.Node): void => {
      if (ts.isTypeParameterDeclaration(node)) bound.add(node.name.text);
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) named.add(node.typeName.text);
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile("type.ts", `type Read = ${text};`, ts.ScriptTarget.Latest));
    return [...named].filter((name) => parameterNames.has(name) && !bound.has(name));
  };

  const cache = new Map<string, TypeEntry>();
  const gaps: Gap[] = [];
  /* "Public" means here: stands in some table. */
  const isPublic = new Set(typeNames);

  /* ---------------------------------------------------------------- */

  const textOf = (node: ts.Node): string =>
    node.getText(node.getSourceFile()).replace(/\s+/g, " ").trim();

  const descriptionOf = (name: ts.Node): string => {
    const symbol = checker.getSymbolAtLocation(name);
    if (symbol === undefined) return "";
    return ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  };

  const propName = (member: ts.PropertySignature): string =>
    ts.isStringLiteral(member.name) || ts.isIdentifier(member.name)
      ? member.name.text
      : member.name.getText(member.getSourceFile());

  /** Named props only: methods and index signatures are not. */
  const membersOf = (node: ts.Node): ts.PropertySignature[] => {
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
  const reference = (
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
  const rootName = (type: ts.Node): string | undefined => reference(type)?.name;

  /* ---------------------------------------------------------------- */
  /* Standardwerte                                                     */
  /* ---------------------------------------------------------------- */

  /** Does this function belong to this props type?

      Two shapes occur, and both are checked rather than guessed from the name:
      an annotation on the parameter (`{ … }: TabsProps`) and a type argument
      on the surrounding `forwardRef<HTMLDivElement, TabsProps>`. */
  const belongsTo = (
    fn: ts.Node,
    parameter: ts.ParameterDeclaration,
    typeName: string,
  ): boolean => {
    if (parameter.type !== undefined && rootName(parameter.type) === typeName) return true;
    const parentNode: ts.Node | undefined = fn.parent;
    if (parentNode !== undefined && ts.isCallExpression(parentNode)) {
      for (const argument of parentNode.typeArguments ?? []) {
        if (rootName(argument) === typeName) return true;
      }
    }
    return false;
  };

  /** The default values a component sets while unpacking its props.

      From there and nowhere else. Inventing a default out of a type - `boolean`
      therefore `false` - would be guessing, and a guessed default in a table is
      worse than an empty column. */
  const defaultValues = (declaration: Declaration): Map<string, string> => {
    const values = new Map<string, string>();
    const wanted = declaration.name.text;
    const visit = (node: ts.Node): void => {
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isFunctionExpression(node) ||
          ts.isArrowFunction(node)) &&
        node.parameters.length > 0
      ) {
        const first = node.parameters[0]!;
        if (ts.isObjectBindingPattern(first.name) && belongsTo(node, first, wanted)) {
          for (const element of first.name.elements) {
            if (element.initializer === undefined) continue;
            const name = element.propertyName ?? element.name;
            if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
              values.set(name.text, textOf(element.initializer));
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(declaration.getSourceFile());
    return values;
  };

  /* ---------------------------------------------------------------- */
  /* Members and where they stand                                      */
  /* ---------------------------------------------------------------- */

  /** Where an entry is explained - for reporting a gap, even where the entry
      ends up as a copy in another table. */
  const places = new WeakMap<PropEntry, { file: string; line: number }>();
  const withPlace = (from: PropEntry, to: PropEntry): PropEntry => {
    const place = places.get(from);
    if (place !== undefined) places.set(to, place);
    return to;
  };

  const isExported = (declaration: Declaration): boolean =>
    (ts.getCombinedModifierFlags(declaration) & ts.ModifierFlags.Export) !== 0;

  /** A helper type's type parameters replaced by the arguments at its use -
      over identifiers, not over substrings. */
  const substitute = (text: string, substitutions: ReadonlyMap<string, string>): string =>
    substitutions.size === 0 ? text : text.replace(/[A-Za-z_$][\w$]*/g, (identifier) => substitutions.get(identifier) ?? identifier);

  /** A member's tag, its text on one line; `undefined` where it has none. Of
      all tags only `@default` and `@deprecated` are read - `@remarks`,
      `@since` and the rest are dropped with the description they are not part
      of. */
  const tagOf = (member: ts.PropertySignature, name: string): string | undefined => {
    const tag = ts.getJSDocTags(member).find((t) => t.tagName.text === name);
    return tag === undefined ? undefined : (ts.getTextOfJSDocComment(tag.comment) ?? "").replace(/\s+/g, " ").trim();
  };

  /** Does a default read as code: a literal, an identifier or a property
      access? Everything else is a phrase. */
  const isValue = (text: string): boolean => {
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
  const substitutionsOf = (declaration: Declaration, args: readonly ts.TypeNode[]): Map<string, string> => {
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
  const aliasOf = (node: ts.TypeReferenceNode): ts.TypeAliasDeclaration | undefined => {
    let symbol = checker.getSymbolAtLocation(node.typeName);
    if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0) symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
    return declaration === undefined || declaration.getSourceFile().isDeclarationFile ? undefined : declaration;
  };

  /** The literals a type comes to over any number of alias hops, in the order
      they are written; `undefined` where any part is no string, number or
      boolean literal. */
  const literalsOf = (node: ts.TypeNode, depth: number): string[] | undefined => {
    /* A chain this long is a cycle, not a list. */
    if (depth > 8) return undefined;
    if (ts.isParenthesizedTypeNode(node)) return literalsOf(node.type, depth);
    if (ts.isLiteralTypeNode(node)) return node.literal.kind === ts.SyntaxKind.NullKeyword ? undefined : [textOf(node)];
    if (ts.isUnionTypeNode(node)) {
      const parts = node.types.map((part) => literalsOf(part, depth));
      return parts.every((part) => part !== undefined) ? parts.flat() : undefined;
    }
    const alias = ts.isTypeReferenceNode(node) ? aliasOf(node) : undefined;
    return alias === undefined ? undefined : literalsOf(alias.type, depth + 1);
  };

  /** A type cell's values beneath its name: only where the cell is one named
      alias (or an array of one) - an inline union shows its values already,
      and an interface, a function or a mixed union is no list. */
  const expansionOf = (node: ts.TypeNode): string | undefined => {
    const named = ts.isArrayTypeNode(node) ? node.elementType : node;
    if (!ts.isTypeReferenceNode(named) || aliasOf(named) === undefined) return undefined;
    const literals = literalsOf(named, 0);
    return literals === undefined ? undefined : [...new Set(literals)].join(" | ");
  };

  /** One member as an entry, together with the component's default. */
  const entryOf = (
    member: ts.PropertySignature,
    defaults: ReadonlyMap<string, string>,
    substitutions: ReadonlyMap<string, string> = new Map(),
  ): PropEntry => {
    const key = propName(member);
    const file = member.getSourceFile();
    const line = file.getLineAndCharacterOfPosition(member.getStart(file)).line + 1;
    const fromPattern = defaults.get(key);
    const fromTag = tagOf(member, "default");
    /* The tag wins, and it may not say what the code does not do: a table
       showing a default the component never sets is worse than an empty
       column. */
    if (fromTag !== undefined && fromPattern !== undefined && fromTag !== fromPattern.trim()) {
      throw new Error(
        `${file.fileName}:${line}  ${key}: \`@default\` says \`${fromTag}\`, the destructuring pattern \`${fromPattern}\`.`,
      );
    }
    const defaultValue = fromTag ?? fromPattern;
    const deprecated = tagOf(member, "deprecated");
    const expansion = member.type === undefined ? undefined : expansionOf(member.type);
    const entry: PropEntry = {
      name: key,
      type: member.type === undefined ? "unknown" : substitute(textOf(member.type), substitutions),
      ...(expansion === undefined ? {} : { expansion }),
      optional: member.questionToken !== undefined,
      ...(defaultValue === undefined ? {} : { defaultValue }),
      ...(fromTag !== undefined && !isValue(fromTag) ? { defaultIsPhrase: true as const } : {}),
      ...(deprecated === undefined ? {} : { deprecated }),
      description: descriptionOf(member.name),
    };
    places.set(entry, { file: file.fileName, line });
    return entry;
  };

  /** The members of every branch of a conditional type, once per name.

      Optional where a branch carries it as optional; described with the first
      comment a branch carries. The type is that of the first branch - the
      branches differ in whether a member is required, not in its shape. */
  const branchMembers = (node: ts.TypeNode, substitutions: ReadonlyMap<string, string>): PropEntry[] => {
    const branches: ts.TypeNode[] = [];
    const collect = (type: ts.TypeNode): void => {
      if (ts.isConditionalTypeNode(type)) {
        collect(type.trueType);
        collect(type.falseType);
      } else if (ts.isParenthesizedTypeNode(type)) collect(type.type);
      else branches.push(type);
    };
    collect(node);
    const found = new Map<string, PropEntry>();
    for (const branch of branches) {
      for (const member of membersOf(branch)) {
        const entry = entryOf(member, new Map(), substitutions);
        const previous = found.get(entry.name);
        if (previous === undefined) {
          found.set(entry.name, entry);
          continue;
        }
        const merged = withPlace(previous, {
          ...previous,
          optional: previous.optional || entry.optional,
          description: previous.description || entry.description,
        });
        found.set(entry.name, merged);
      }
    }
    return [...found.values()];
  };

  /** Per name the first occurrence: a member of one's own overrides what a
      parent declares under the same name. */
  const uniqueByName = (props: readonly PropEntry[]): PropEntry[] => {
    const seen = new Set<string>();
    return props.filter((p) => !seen.has(p.name) && seen.add(p.name));
  };

  /** The arms of a union as one list.

      The order is that of first appearance. A member is optional where an arm
      carries it as optional or not at all; its type is the differing shapes of
      the arms, a function put in parentheses so that `(a: Z) => void | …` is
      not read as a return type.

      A member typed `never` in an arm is a prohibition there, not a shape: it
      gives the row no type, and its sentence ("not together with `footer`")
      stands after those of the arms that do. A member `never` in every arm
      stays `never`, and `readType` leaves it out. */
  const mergeArms = (arms: readonly (readonly PropEntry[])[]): PropEntry[] => {
    const names: string[] = [];
    for (const arm of arms) for (const p of arm) if (!names.includes(p.name)) names.push(p.name);
    return names.map((name) => {
      const occurrences = arms.map((arm) => arm.find((p) => p.name === name));
      const present = occurrences.filter((p): p is PropEntry => p !== undefined);
      const shaped = present.filter((p) => p.type !== "never");
      const forbidding = present.filter((p) => p.type === "never");
      const first = shaped[0] ?? present[0]!;
      const shapes = [...new Set((shaped.length === 0 ? present : shaped).map((p) => p.type))];
      const type =
        shapes.length === 1 ? shapes[0]! : shapes.map((f) => (f.includes("=>") ? `(${f})` : f)).join(" | ");
      const description = [
        ...new Set([...shaped, ...forbidding].map((p) => p.description).filter((b) => b !== "")),
      ].join(" ");
      /* Deprecated in one arm is deprecated: the arm that forbids it beside
         its new name does not carry the tag. */
      const deprecated = present.find((p) => p.deprecated !== undefined)?.deprecated;
      /* The values belong to the one name; two shapes are no name. */
      const { expansion, ...rest } = first;
      return withPlace(first, {
        ...rest,
        ...(expansion === undefined || shapes.length > 1 ? {} : { expansion }),
        ...(deprecated === undefined ? {} : { deprecated }),
        type,
        optional: present.length < arms.length || present.some((p) => p.optional),
        description,
      });
    });
  };

  /* ---------------------------------------------------------------- */
  /* Inheritance                                                       */
  /* ---------------------------------------------------------------- */

  interface Inheritance {
    inherits?: string;
    omitted: string[];
    props: PropEntry[];
    /** Did the inheritance come from a type of THIS library?

        Decides what an `Omit` was aimed at. `Omit<ButtonProps, "size">` takes
        a prop of the library out - it says nothing about the attributes of
        `<button>`, and it has no business in the table's closing sentence.
        `Omit<HTMLAttributes<…>, "title">` takes something away exactly there,
        and the sentence has to say so. */
    ownLibrary?: boolean;
  }

  /** The names an `Omit<…, "a" | "b">` takes out. */
  const omittedNames = (type: ts.TypeNode): string[] => {
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

  const resolveInheritance = (type: ts.Node, depth: number, omitted: readonly string[]): Inheritance => {
    const empty: Inheritance = { omitted: [], props: [] };
    /* A cycle over four levels is no longer an inheritance but a defect in the
       source; the recursion stops here rather than hanging the build. */
    if (depth > 4) return empty;

    const found = reference(type);
    if (found === undefined) return empty;
    const { name, args } = found;

    if ((name === "Omit" || name === "Pick") && args.length === 2) {
      const named = omittedNames(args[1]!);
      const next = name === "Omit" ? [...omitted, ...named] : omitted;
      const inherited = resolveInheritance(args[0]!, depth + 1, next);
      if (name === "Pick") {
        return { ...inherited, props: inherited.props.filter((p) => named.includes(p.name)) };
      }
      return {
        ...inherited,
        omitted: inherited.ownLibrary === true ? inherited.omitted : [...inherited.omitted, ...named],
        props: inherited.props.filter((p) => !named.includes(p.name)),
      };
    }

    if (name === "ComponentPropsWithoutRef" || name === "ComponentPropsWithRef") {
      return { inherits: POLYMORPH, omitted: [], props: [] };
    }

    if (name in ATTRIBUTE_TYPES) {
      const fixed = ATTRIBUTE_TYPES[name];
      if (fixed !== null && fixed !== undefined) return { inherits: fixed, omitted: [], props: [] };
      const argument = args[0];
      const elementName = argument === undefined ? undefined : rootName(argument);
      const printed = elementName === undefined ? undefined : ELEMENT_TYPES[elementName];
      return { inherits: printed ?? UNKNOWN_ELEMENT, omitted: [], props: [] };
    }

    const own = declarations.get(name);
    if (own !== undefined && ts.isTypeAliasDeclaration(own) && ts.isConditionalTypeNode(own.type)) {
      /* A conditional helper type is a mechanism and not a type a reader
         knows: its members stand without an origin, with the type arguments of
         this use rather than with its own parameters. */
      return {
        omitted: [],
        props: branchMembers(own.type, substitutionsOf(own, args)).filter((p) => !omitted.includes(p.name)),
      };
    }
    if (own !== undefined) {
      const parentType = readType(own, depth + 1);
      /* "from ButtonProps" tells the reader something; the name of a type the
         package does not export names nothing they could import. The members
         are written in the parameters of this use: `EditOptions<Z[K], Z>`
         makes `W` into `Z[K]`, since the table they land in has no `W`. */
      const origin = isExported(own) ? name : undefined;
      const substitutions = substitutionsOf(own, args);
      return {
        inherits: parentType.inherits,
        omitted: [...parentType.omitted],
        ownLibrary: true,
        props: parentType.props
          .filter((p) => !omitted.includes(p.name))
          .map((p) =>
            withPlace(p, {
              ...p,
              type: substitute(p.type, substitutions),
              ...(p.inheritedFrom ?? origin ? { inheritedFrom: p.inheritedFrom ?? origin } : {}),
            }),
          ),
      };
    }

    /* A type these files do not declare - an internal input interface, say. It
       contributes nothing, and that is not an error. */
    return empty;
  };

  /* ---------------------------------------------------------------- */

  function readType(declaration: Declaration, depth = 0): TypeEntry {
    const name = declaration.name.text;
    const done = cache.get(name);
    if (done !== undefined) return done;

    const defaults = defaultValues(declaration);
    const parameter = (declaration.typeParameters ?? []).map(textOf);

    const props: PropEntry[] = [];
    let inherits: string | undefined;
    const omitted: string[] = [];
    /* A part of an intersection that has a table of its own is named and not
       copied out: its table stands on the page anyway. */
    const alsoTakes: string[] = [];

    const takeInheritance = (node: ts.Node, into: PropEntry[]): void => {
      const part = resolveInheritance(node, depth, []);
      if (part.inherits !== undefined && inherits === undefined) inherits = part.inherits;
      omitted.push(...part.omitted);
      into.push(...part.props);
    };

    if (ts.isInterfaceDeclaration(declaration)) {
      /* An interface: its own members, then what it inherits. */
      for (const member of membersOf(declaration)) props.push(entryOf(member, defaults));
      const inherited: PropEntry[] = [];
      for (const clause of declaration.heritageClauses ?? []) {
        for (const entry of clause.types) takeInheritance(entry, inherited);
      }
      props.push(...inherited);
    } else {
      /* A type alias: its parts in the order in which they stand. A part with
         a table of its own is named rather than copied out - except in the arm
         of a union, where it holds for that arm only and is merged with the
         other arms member by member. */
      const readArm = (arm: ts.TypeNode, into: PropEntry[], inUnion = false): void => {
        const parts = ts.isIntersectionTypeNode(arm) ? arm.types : [arm];
        for (const part of parts) {
          const partName = rootName(part);
          if (ts.isTypeLiteralNode(part)) {
            for (const member of membersOf(part)) into.push(entryOf(member, defaults));
          } else if (!inUnion && partName !== undefined && isPublic.has(partName) && declarations.has(partName)) {
            if (!alsoTakes.includes(partName)) alsoTakes.push(partName);
          } else {
            takeInheritance(part, into);
          }
        }
      };
      const withoutParens = (type: ts.TypeNode): ts.TypeNode =>
        ts.isParenthesizedTypeNode(type) ? withoutParens(type.type) : type;

      if (ts.isUnionTypeNode(declaration.type)) {
        /* A discriminated union: ONE table, every member once. Where the arms
           declare a member differently, both shapes stand there. */
        const arms = declaration.type.types.map((arm) => {
          const list: PropEntry[] = [];
          readArm(withoutParens(arm), list, true);
          return uniqueByName(list);
        });
        props.push(...mergeArms(arms));
      } else {
        readArm(declaration.type, props);
      }
    }

    /* A member that is `never` and nothing else is a prohibition with nothing
       to pass: no row. */
    const unique = uniqueByName(props).filter((p) => p.type !== "never");

    /* A gap belongs to the table in which the prop stands without an origin:
       that is where somebody reads it. With an origin it is reported at the
       parent, where the parent has a page. */
    for (const prop of unique) {
      if (prop.description !== "" || prop.inheritedFrom !== undefined) continue;
      const place = places.get(prop);
      if (place !== undefined) gaps.push({ type: name, prop: prop.name, ...place });
    }

    const entry: TypeEntry = {
      name,
      parameter,
      ...(inherits === undefined ? {} : { inherits }),
      omitted: [...new Set(omitted)].sort(),
      props: unique,
      ...(alsoTakes.length === 0 ? {} : { alsoTakes }),
    };
    cache.set(name, entry);
    return entry;
  }

  const types: Record<string, TypeEntry> = {};
  for (const typeName of typeNames) {
    const declaration = declarations.get(typeName);
    if (declaration === undefined) {
      throw new Error(`\`${typeName}\` is required, but is not declared in the files that were read.`);
    }
    const entry = readType(declaration);
    const introduced = new Set((declaration.typeParameters ?? []).map((p) => p.name.text));
    for (const prop of entry.props) {
      const free = parametersNamed(prop.type).filter((p) => !introduced.has(p));
      if (free.length > 0) {
        throw new Error(
          `\`${typeName}.${prop.name}\` is typed \`${prop.type}\`, which names ${free.map((p) => `\`${p}\``).join(", ")}: ` +
            `a type parameter the table's header does not introduce.`,
        );
      }
    }
    types[typeName] = entry;
  }

  /* Only what really ends up in a table. A type that was read only as a
     parent and has no page of its own is not chased. */
  return { types, gaps: gaps.filter((l) => isPublic.has(l.type)) };
}
