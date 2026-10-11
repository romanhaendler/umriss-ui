/* Reading one type into an entry: its own members, what it inherits (and what
   an `Omit` takes out, and where React declares the rest), the arms of a
   union merged into one table, and the gaps and flags found on the way. */

import ts from "typescript";
import { placeOf, referencesOf, unexported, withPlace, type Ctx } from "./propsContext.ts";
import { defaultValues, withDefaults } from "./propsDefaults.ts";
import type { Flag, PropEntry, TypeEntry } from "./propsReader.ts";
import {
  declarationOf,
  descriptionOf,
  expansionOf,
  isExported,
  isValue,
  membersOf,
  omittedNames,
  propName,
  reference,
  rootName,
  substitute,
  substitutionsOf,
  tagOf,
  textOf,
  type Declaration,
} from "./propsSyntax.ts";

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

/** One member as an entry, with the default its `@default` tag names. */
export const entryOf = (ctx: Ctx, member: ts.PropertySignature, substitutions: ReadonlyMap<string, string> = new Map()): PropEntry => {
  const fromTag = tagOf(member, "default");
  const deprecated = tagOf(member, "deprecated");
  const expansion = member.type === undefined ? undefined : expansionOf(ctx.checker, member.type);
  const references = member.type === undefined ? [] : referencesOf(ctx, member.type);
  const entry: PropEntry = {
    name: propName(member),
    type: member.type === undefined ? "unknown" : substitute(textOf(member.type), substitutions),
    ...(expansion === undefined ? {} : { expansion }),
    optional: member.questionToken !== undefined,
    ...(fromTag === undefined ? {} : { defaultValue: fromTag }),
    ...(fromTag !== undefined && !isValue(fromTag) ? { defaultIsPhrase: true as const } : {}),
    ...(deprecated === undefined ? {} : { deprecated }),
    ...(references.length === 0 ? {} : { references }),
    description: descriptionOf(ctx.checker, member.name),
  };
  ctx.sources.set(entry, member);
  ctx.members.set(entry, [member]);
  return entry;
};

/** The members of every branch of a conditional type, once per name.

    Optional where a branch carries it as optional; described with the first
    comment a branch carries. The type is that of the first branch - the
    branches differ in whether a member is required, not in its shape. */
export const branchMembers = (ctx: Ctx, node: ts.TypeNode, substitutions: ReadonlyMap<string, string>): PropEntry[] => {
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
      const entry = entryOf(ctx, member, substitutions);
      const previous = found.get(entry.name);
      if (previous === undefined) {
        found.set(entry.name, entry);
        continue;
      }
      const merged = withPlace(ctx,
        previous,
        {
          ...previous,
          optional: previous.optional || entry.optional,
          description: previous.description || entry.description,
        },
        entry,
      );
      found.set(entry.name, merged);
    }
  }
  return [...found.values()];
};

/** Per name the first occurrence: a member of one's own overrides what a
    parent declares under the same name. */
export const uniqueByName = (props: readonly PropEntry[]): PropEntry[] => {
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
export const mergeArms = (ctx: Ctx, arms: readonly (readonly PropEntry[])[]): PropEntry[] => {
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
    const references = [...new Set(shaped.flatMap((p) => p.references ?? []))];
    return withPlace(ctx,
      first,
      {
        ...rest,
        ...(expansion === undefined || shapes.length > 1 ? {} : { expansion }),
        ...(deprecated === undefined ? {} : { deprecated }),
        ...(references.length === 0 ? {} : { references }),
        type,
        optional: present.length < arms.length || present.some((p) => p.optional),
        description,
      },
      ...present,
    );
  });
};

export interface Inheritance {
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

export const resolveInheritance = (ctx: Ctx, type: ts.Node, depth: number, omitted: readonly string[]): Inheritance => {
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
    const inherited = resolveInheritance(ctx, args[0]!, depth + 1, next);
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

  const own = declarationOf(ctx.checker, type);
  if (own !== undefined && ts.isTypeAliasDeclaration(own) && ts.isConditionalTypeNode(own.type)) {
    /* A conditional helper type is a mechanism and not a type a reader
       knows: its members stand without an origin, with the type arguments of
       this use rather than with its own parameters. */
    return {
      omitted: [],
      props: branchMembers(ctx, own.type, substitutionsOf(own, args)).filter((p) => !omitted.includes(p.name)),
    };
  }
  if (own !== undefined) {
    const parentType = readType(ctx, own, depth + 1);
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
          withPlace(ctx, p, {
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

export function readType(ctx: Ctx, declaration: Declaration, depth = 0): TypeEntry {
  const name = declaration.name.text;
  const done = ctx.cache.get(declaration);
  if (done !== undefined) return done;

  const defaults = defaultValues(ctx, declaration);
  const parameter = (declaration.typeParameters ?? []).map(textOf);

  const props: PropEntry[] = [];
  let inherits: string | undefined;
  const omitted: string[] = [];
  /* A part of an intersection that has a table of its own is named and not
     copied out: its table stands on the page anyway. */
  const alsoTakes: string[] = [];

  const takeInheritance = (node: ts.Node, into: PropEntry[]): void => {
    const part = resolveInheritance(ctx, node, depth, []);
    if (part.inherits !== undefined && inherits === undefined) inherits = part.inherits;
    omitted.push(...part.omitted);
    into.push(...part.props);
  };

  if (ts.isInterfaceDeclaration(declaration)) {
    /* An interface: its own members, then what it inherits. */
    for (const member of membersOf(declaration)) props.push(entryOf(ctx, member));
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
        const partDeclaration = declarationOf(ctx.checker, part);
        if (ts.isTypeLiteralNode(part)) {
          for (const member of membersOf(part)) into.push(entryOf(ctx, member));
        } else if (!inUnion && partName !== undefined && partDeclaration !== undefined && ctx.isPublic.has(partDeclaration)) {
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
      props.push(...mergeArms(ctx, arms));
    } else {
      readArm(declaration.type, props);
    }
  }

  /* A member that is `never` and nothing else is a prohibition with nothing
     to pass: no row. */
  const unique = withDefaults(ctx,
    uniqueByName(props).filter((p) => p.type !== "never"),
    defaults,
  );

  /* A gap - and a flag - belongs to the table in which the prop stands
     without an origin: that is where somebody reads it. With an origin it is
     reported at the parent, where the parent has a page. */
  for (const prop of unique) {
    const source = ctx.sources.get(prop);
    if (prop.inheritedFrom !== undefined || source === undefined) continue;
    if (prop.description === "") ctx.gaps.push({ of: declaration, gap: { type: name, prop: prop.name, ...placeOf(source) } });
    const flag = (kind: Flag["kind"], found: readonly string[]): void => {
      if (found.length > 0) ctx.flags.push({ of: declaration, flag: { kind, type: name, prop: prop.name, ...placeOf(source), found } });
    };
    flag("reference", [prop.description, prop.deprecated ?? "", prop.defaultIsPhrase === true ? prop.defaultValue! : ""].flatMap(ctx.check));
    /* No exception list: where the default is no value, the tag is a
       phrase - "no default" included. */
    if (prop.defaultValue === undefined) {
      const sentences = prop.description.replace(/\s+/g, " ").split(/(?<=\.) /);
      flag("default", sentences.filter((sentence) => /\bdefault\b/i.test(sentence)));
    }
    flag("unexported", unexported(ctx, prop.references ?? []));
  }

  const entry: TypeEntry = {
    name,
    parameter,
    ...(inherits === undefined ? {} : { inherits }),
    omitted: [...new Set(omitted)].sort(),
    props: unique,
    ...(alsoTakes.length === 0 ? {} : { alsoTakes }),
  };
  ctx.cache.set(declaration, entry);
  return entry;
}
