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

   The type stands as it was written. `"primary" | "secondary" | "ghost" |
   "danger"` is what the reader needs; the resolved form of a mapped type is
   unreadable. */

import ts from "typescript";

export interface PropEntry {
  name: string;
  /** The type, exactly as it stands in the source. */
  type: string;
  optional: boolean;
  /** Out of the component's destructuring pattern, where there is one. */
  defaultValue?: string;
  description: string;
  /** Set where the prop comes from another type of THIS library. */
  inheritedFrom?: string;
}

export interface TypeEntry {
  name: string;
  /** The type parameters as they stand: `["T"]`, `["K", "S"]`. */
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

  /** One member as an entry, together with the component's default. */
  const entryOf = (
    member: ts.PropertySignature,
    defaults: ReadonlyMap<string, string>,
    substitutions: ReadonlyMap<string, string> = new Map(),
  ): PropEntry => {
    const key = propName(member);
    const defaultValue = defaults.get(key);
    const entry: PropEntry = {
      name: key,
      type: member.type === undefined ? "unknown" : substitute(textOf(member.type), substitutions),
      optional: member.questionToken !== undefined,
      ...(defaultValue === undefined ? {} : { defaultValue }),
      description: descriptionOf(member.name),
    };
    const file = member.getSourceFile();
    const { line } = file.getLineAndCharacterOfPosition(member.getStart(file));
    places.set(entry, { file: file.fileName, line: line + 1 });
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
      not read as a return type. */
  const mergeArms = (arms: readonly (readonly PropEntry[])[]): PropEntry[] => {
    const names: string[] = [];
    for (const arm of arms) for (const p of arm) if (!names.includes(p.name)) names.push(p.name);
    return names.map((name) => {
      const occurrences = arms.map((arm) => arm.find((p) => p.name === name));
      const present = occurrences.filter((p): p is PropEntry => p !== undefined);
      const first = present[0]!;
      const shapes = [...new Set(present.map((p) => p.type))];
      const type =
        shapes.length === 1 ? shapes[0]! : shapes.map((f) => (f.includes("=>") ? `(${f})` : f)).join(" | ");
      const description = [...new Set(present.map((p) => p.description).filter((b) => b !== ""))].join(" ");
      return withPlace(first, {
        ...first,
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
      const substitutions = new Map<string, string>();
      (own.typeParameters ?? []).forEach((parameter, i) => {
        const argument = args[i];
        if (argument !== undefined) substitutions.set(parameter.name.text, textOf(argument));
      });
      return {
        omitted: [],
        props: branchMembers(own.type, substitutions).filter((p) => !omitted.includes(p.name)),
      };
    }
    if (own !== undefined) {
      const parentType = readType(own, depth + 1);
      /* "from ButtonProps" tells the reader something; the name of a type the
         package does not export names nothing they could import. */
      const origin = isExported(own) ? name : undefined;
      return {
        inherits: parentType.inherits,
        omitted: [...parentType.omitted],
        ownLibrary: true,
        props: parentType.props
          .filter((p) => !omitted.includes(p.name))
          .map((p) => withPlace(p, { ...p, ...(p.inheritedFrom ?? origin ? { inheritedFrom: p.inheritedFrom ?? origin } : {}) })),
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
    const parameter = (declaration.typeParameters ?? []).map((p) => p.name.text);

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
      /* A type alias: its parts in the order in which they stand. */
      const readArm = (arm: ts.TypeNode, into: PropEntry[]): void => {
        const parts = ts.isIntersectionTypeNode(arm) ? arm.types : [arm];
        for (const part of parts) {
          const partName = rootName(part);
          if (ts.isTypeLiteralNode(part)) {
            for (const member of membersOf(part)) into.push(entryOf(member, defaults));
          } else if (partName !== undefined && isPublic.has(partName) && declarations.has(partName)) {
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
          readArm(withoutParens(arm), list);
          return uniqueByName(list);
        });
        props.push(...mergeArms(arms));
      } else {
        readArm(declaration.type, props);
      }
    }

    const unique = uniqueByName(props);

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
    types[typeName] = readType(declaration);
  }

  /* Only what really ends up in a table. A type that was read only as a
     parent and has no page of its own is not chased. */
  return { types, gaps: gaps.filter((l) => isPublic.has(l.type)) };
}
