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

   The type stands as it was written, and beside it what it resolves to and
   where it is defined. `"primary" | "secondary" | "ghost" | "danger"` is what
   the reader needs; the resolved form of a mapped type is unreadable. So a
   named alias that comes to a list of literals keeps its name - whoever types
   a wrapper imports `ButtonVariant` - and carries the list as well; nothing
   else is resolved. Every other type of the library a cell names is recorded
   by name, and one that has no table of its own is read as a definition: its
   members as a table, or its declaration as it is written. */

import ts from "typescript";
import { referencesOf, parametersNamed, unexported, type Ctx } from "./propsContext.ts";
import { readType } from "./propsInherit.ts";
import { descriptionOf, expansionOf, isExported, textOf, type Declaration } from "./propsSyntax.ts";

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
  /** The types of the library the type names, in the order they stand - each
      has a table or a definition. */
  references?: readonly string[];
  description: string;
  /** Set where the prop comes from another type of THIS library. */
  inheritedFrom?: string;
  /** The examples and scenarios that use it - set by the generator, not by
      the reader (`shownIn.ts`); absent where none does. */
  shownIn?: readonly ShownIn[];
}

/** An example or a scenario that uses a row. */
export interface ShownIn {
  /** The page's id; `scenarios` for a scenario. */
  page: string;
  /** Its anchor on that page. */
  example: string;
  title: string;
  /** The page's name - "Scenarios" for a scenario - which a link to it
      from another page carries. */
  pageName: string;
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
  /** Set where the type has no table and a table names it: what "Types on
      this page" shows of it. */
  definition?: Definition;
}

export interface Definition {
  /** The type's own JSDoc. */
  description: string;
  /** The package it comes from, where that is not the package read:
      `"@umriss-ui/core"`. */
  from?: string;
  /** Where the type is no list of named members - a union, a function, a
      mapped type, an interface with methods: its declaration as written,
      without `export`. The members table is drawn otherwise. */
  declaration?: string;
  /** The library's types the declaration names. */
  references?: readonly string[];
  /** Where the declaration is an alias of one named alias (or an array of
      one) that comes to literals: its values, as a row's `expansion`. */
  expansion?: string;
}

export interface Gap {
  type: string;
  prop: string;
  /** An absolute path; whoever wants it shortened knows better against what. */
  file: string;
  line: number;
}

/** What the gate stops at, where it stands.

    - `reference`: a text carries what the caller's `check` found in it.
    - `default`: a description says "default" and the row shows none - the
      default belongs in `@default`, as a phrase where it is no value.
    - `unexported`: a cell, a definition or a header names a type of the
      library that no entry exports - a name the reader cannot import. */
export interface Flag extends Gap {
  kind: "reference" | "default" | "unexported";
  found: readonly string[];
}

export interface Reading {
  types: Record<string, TypeEntry>;
  /** Where each row of `types` is declared, by `Type.prop`: one place per
      member it was read from - two where it merges two arms of a union - as
      `declarationKey` writes it. What an example uses is matched against
      these (`shownIn.ts`). */
  declaredAt: Record<string, readonly string[]>;
  gaps: readonly Gap[];
  /** The rows and definitions whose texts `check` found something in, the
      rows that state a default in prose, and - where entries are given -
      every name of a type no entry exports. */
  flags: readonly Flag[];
}

/** A declaration's place as one string - the same in two programs over the
    same files, which is what lets a use in an example find its row. */
export function declarationKey(node: ts.Node): string {
  return `${node.getSourceFile().fileName}:${node.getStart()}`;
}

/** Reads the named types out of the named files, and after them every type
    of the library they name that has no table: as a definition.

    `files` are absolute paths. The order of the output follows `typeNames`, so
    that two runs produce the same file. `check` says what a row's text may
    not carry; the reader only notes where it stands, as it does a gap.
    `options` are the package's own compiler options where it has them: with
    the `paths` to its neighbours' source, a type from core is read where it is
    written, not from a dist that may not be built. `entries` are the modules
    a reader imports from - the package's and its neighbours'; where they are
    given, every type a page names must be exported by one of them.
    `alsoDefine` names further types to define where they have no table -
    what the API index shows. */
export function readProps(
  files: readonly string[],
  typeNames: readonly string[],
  check: (text: string) => readonly string[] = () => [],
  options: ts.CompilerOptions = {},
  entries: readonly string[] = [],
  alsoDefine: readonly string[] = [],
): Reading {
  const program = ts.createProgram([...files, ...entries], {
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    strict: true,
    skipLibCheck: true,
    ...options,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  /* The package read; a neighbour's source stands in the program as well. */
  const own = new Set(files);

  /* What the entries export, re-exports followed to their declaration. */
  const importable = new Set<ts.Declaration>();
  for (const entry of entries) {
    const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!);
    if (module === undefined) throw new Error(`\`${entry}\` is not a module the compiler can read.`);
    for (const exported of checker.getExportsOfModule(module)) {
      const target = (exported.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(exported) : exported;
      for (const declaration of target.declarations ?? []) importable.add(declaration);
    }
  }


  /* By name only for what the caller asks for, and there an exported
     declaration wins over a private one of the same name - and one an entry
     exports over one only its file does (core's `Side` of a limit, not the
     popover's). Inside the source a name is resolved by the checker
     (`declarationOf`): two private `CommonProps` in two files are two types. */
  const declarations = new Map<string, Declaration>();
  const rank = (declaration: Declaration) => (importable.has(declaration) ? 2 : isExported(declaration) ? 1 : 0);
  for (const file of program.getSourceFiles()) {
    if (!own.has(file.fileName)) continue;
    ts.forEachChild(file, (node) => {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const known = declarations.get(node.name.text);
        if (known === undefined || rank(node) > rank(known)) declarations.set(node.name.text, node);
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
  for (const file of program.getSourceFiles()) if (own.has(file.fileName)) collectParameters(file);

  /* "Public" means here: stands in some table. */
  const isPublic = new Set(
    typeNames.map((typeName) => {
      const declaration = declarations.get(typeName);
      if (declaration === undefined) {
        throw new Error(`\`${typeName}\` is required, but is not declared in the files that were read.`);
      }
      return declaration;
    }),
  );

  const ctx: Ctx = {
    checker,
    entries,
    importable,
    parameterNames,
    named: new Map<string, Declaration>(),
    cache: new Map<Declaration, TypeEntry>(),
    gaps: [],
    flags: [],
    isPublic,
    check,
    sources: new WeakMap<PropEntry, ts.PropertySignature>(),
    members: new WeakMap<PropEntry, readonly ts.PropertySignature[]>(),
  };
  const { named, gaps, flags } = ctx;

  /** A flag that belongs to a declaration as a whole: its comment, its
      header, its declaration as written. */
  const flagAt = (declaration: Declaration, kind: Flag["kind"], prop: string, found: readonly string[]): void => {
    if (found.length === 0) return;
    const file = declaration.getSourceFile();
    const line = file.getLineAndCharacterOfPosition(declaration.getStart(file)).line + 1;
    flags.push({ of: declaration, flag: { kind, type: declaration.name.text, prop, file: file.fileName, line, found } });
  };
  /** The names a header shows that no entry exports: a table's own, and what
      its parameters' constraints and defaults name. */
  const flagHeader = (declaration: Declaration, table: boolean): void => {
    const own = table && entries.length > 0 && !importable.has(declaration) ? [declaration.name.text] : [];
    const constraints = [...new Set((declaration.typeParameters ?? []).flatMap((t) => referencesOf(ctx, t)))];
    flagAt(declaration, "unexported", "(its header)", [...own, ...unexported(ctx, constraints)]);
  };

  const types: Record<string, TypeEntry> = {};
  for (const typeName of typeNames) {
    const declaration = declarations.get(typeName)!;
    if (types[typeName] === undefined) flagHeader(declaration, true);
    const entry = readType(ctx, declaration);
    const introduced = new Set((declaration.typeParameters ?? []).map((p) => p.name.text));
    for (const prop of entry.props) {
      const free = parametersNamed(ctx, prop.type).filter((p) => !introduced.has(p));
      if (free.length > 0) {
        throw new Error(
          `\`${typeName}.${prop.name}\` is typed \`${prop.type}\`, which names ${free.map((p) => `\`${p}\``).join(", ")}: ` +
            `a type parameter the table's header does not introduce.`,
        );
      }
    }
    types[typeName] = entry;
  }

  /* The definitions: every type a table names and no table is, then every
     type those name, in the order they are first named. A type with a table
     is linked, not defined again. */
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
  /** What a page shows: the tables, and the definitions. */
  const shown = new Set<Declaration>(isPublic);
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
    flagAt(declaration, "reference", "(its comment)", check(description));
    if (hasMembers(declaration)) {
      flagHeader(declaration, false);
      const entry = readType(ctx, declaration);
      types[name] = { ...entry, definition: { description, ...(from === undefined ? {} : { from }) } };
      queue.push(...entry.props.flatMap((p) => p.references ?? []));
    } else {
      const references = referencesOf(ctx, declaration);
      flagAt(declaration, "unexported", "(its declaration)", unexported(ctx, references));
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

  const declaredAt: Record<string, readonly string[]> = {};
  for (const entry of Object.values(types)) {
    for (const prop of entry.props) declaredAt[`${entry.name}.${prop.name}`] = (ctx.members.get(prop) ?? []).map(declarationKey);
  }

  /* Only what really ends up in a table. A type that was read only as a
     parent and has no page of its own is not chased. */
  return {
    types,
    declaredAt,
    gaps: gaps.filter((l) => isPublic.has(l.of)).map((l) => l.gap),
    flags: flags.filter((f) => shown.has(f.of)).map((f) => f.flag),
  };
}
