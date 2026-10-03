/* What a package exports: the exports without JSDoc - the gate's second class
   beside the props - and every export with its declaration, what the API
   index shows (.scratch/api-index, ADR-0044).

   What counts as an export is what the package builds: the entries its
   `vite.config.ts` hands to `build.lib.entry`, the main one and every subpath
   (`wording/de`). No second list of entries, so a new subpath is checked the
   day it is built. An export counts as explained when one of its declarations
   carries a JSDoc comment; a plain block comment for maintainers does not. */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

/** An export without JSDoc, where it is declared. */
export interface UndocumentedExport {
  /** The name a caller imports. */
  name: string;
  file: string;
  line: number;
}

/** A library entry the package builds: its source file, and the subpath a
    caller imports it under - none for the main entry. */
export interface LibraryEntry {
  file: string;
  /** `"wording/de"` for `@umriss-ui/core/wording/de`. */
  subpath?: string;
}

/** The library entries `vite.config.ts` builds, in the order it names them.
    An object's key is the subpath, `index` the main entry. The gate reads
    them, and so does the API index (`llms.ts`).

    ponytail: read as text, not run - a config that computes its entries
    instead of naming them as string literals has to be run here instead. */
export function entriesOf(packageDir: string): LibraryEntry[] {
  const config = readFileSync(join(packageDir, "vite.config.ts"), "utf8");
  const entry = /\bentry:\s*("[^"]*"|\{[^}]*\})/.exec(config)?.[1] ?? "";
  const named = entry.startsWith("{")
    ? [...entry.matchAll(/(?:"([^"]+)"|([\w$]+))\s*:\s*"([^"]+\.tsx?)"/g)].map(([, quoted, bare, file]) => ({ key: quoted ?? bare!, file: file! }))
    : [...entry.matchAll(/"([^"]+\.tsx?)"/g)].map((match) => ({ key: "index", file: match[1]! }));
  if (named.length === 0) throw new Error(`\`${join(packageDir, "vite.config.ts")}\` names no library entry the gate can read.`);
  return named.map(({ key, file }) => ({ file: join(packageDir, file), ...(key === "index" ? {} : { subpath: key }) }));
}

/** Every export of the package's entries without JSDoc, in the order the
    entries name them, re-exports followed to their declaration. */
export function undocumentedExports(packageDir: string): UndocumentedExport[] {
  const entries = entriesOf(packageDir).map((one) => one.file);
  const program = ts.createProgram(entries, {
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    module: ts.ModuleKind.ESNext,
    allowImportingTsExtensions: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  return entries.flatMap((entry) => {
    const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!);
    if (module === undefined) throw new Error(`\`${entry}\` is not a module the compiler can read.`);
    return checker.getExportsOfModule(module).flatMap((exported) => {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declarations = target.declarations ?? [];
      if (declarations.some((one) => ts.getJSDocCommentsAndTags(one).some((doc) => ts.isJSDoc(doc)))) return [];
      const first = declarations[0];
      if (first === undefined) return [{ name: exported.name, file: entry, line: 1 }];
      const file = first.getSourceFile();
      return [{ name: exported.name, file: file.fileName, line: file.getLineAndCharacterOfPosition(first.getStart()).line + 1 }];
    });
  });
}

/** The package's own compiler options, from its `tsconfig.json` - the paths
    to its neighbours' source above all, so that a type from core reads as it
    is written and not as `any` from a dist that was never built. Empty where
    the package has none. */
export function compilerOptionsOf(packageDir: string): ts.CompilerOptions {
  const configPath = join(packageDir, "tsconfig.json");
  if (!existsSync(configPath)) return {};
  return ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} })?.options ?? {};
}

/** What an export is - by what the checker sees, not by its name; only a
    hook is known by its name, a function called `use` and a capital. */
export type ExportKind = "component" | "hook" | "function" | "constant" | "type";

export interface ExportedDeclaration {
  /** The name a caller imports. */
  name: string;
  /** The subpath that exports it (`"wording/de"`); none for the main entry. */
  subpath?: string;
  kind: ExportKind;
  /** The declaration as its `.d.ts` shows it - no body, the JSDoc kept. */
  text: string;
  /** The same without its JSDoc: what the API index shows under the prose. */
  declaration: string;
  /** The JSDoc's text, without its tags. */
  description: string;
  /** The `@param` tags: the parameter, and what it says of it. */
  params: readonly { name: string; text: string }[];
  /** The `@returns` tag's text. */
  returns?: string;
  /** The `@deprecated` sentence; set, even empty, where the export is. */
  deprecated?: string;
  /** The type names the declaration uses, in the order they stand - the
      library's among them, which the index links. */
  references: readonly string[];
}

const read = new Map<string, ExportedDeclaration[]>();

/** Every export of the package's entries, in the order the entries name
    them, with its declaration as the compiler emits it for a `.d.ts`.

    The declaration emit is the one form that is exact without being the
    implementation: bodies gone, comments kept, and the same text the npm
    package's `dist/index.d.ts` carries. Read once per package and run: the
    props gate and the text generator ask in the same run. */
export function exportedDeclarations(packageDir: string): ExportedDeclaration[] {
  const known = read.get(packageDir);
  if (known !== undefined) return known;
  const entries = entriesOf(packageDir);
  /* The package's own options where it has them (`compilerOptionsOf`). */
  const own = compilerOptionsOf(packageDir);
  const options: ts.CompilerOptions = {
    ...(Object.keys(own).length > 0 ? own : { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022, strict: true, skipLibCheck: true }),
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    removeComments: false,
  };
  const program = ts.createProgram(entries.map((one) => one.file), options);
  const checker = program.getTypeChecker();

  const emitted = new Map<string, ts.SourceFile>();
  const declarationsOf = (file: ts.SourceFile): ts.SourceFile => {
    const known = emitted.get(file.fileName);
    if (known !== undefined) return known;
    let text = "";
    program.emit(file, (name, data) => {
      if (name.endsWith(".d.ts")) text = data;
    }, undefined, true);
    const parsedFile = ts.createSourceFile(`${file.fileName}.d.ts`, text, ts.ScriptTarget.Latest, true);
    emitted.set(file.fileName, parsedFile);
    return parsedFile;
  };

  /* A component renders: a forwardRef or memo result (`$$typeof`), or a
     function of one props object that returns an element or nothing. */
  const rendersAnElement = (type: ts.Type): boolean =>
    type.aliasSymbol?.name === "ReactNode" ||
    (type.isUnion() ? type.types : [type]).every(
      (one) => (one.flags & ts.TypeFlags.Null) !== 0 || ["Element", "ReactElement", "ReactPortal"].includes(one.getSymbol()?.name ?? ""),
    );
  const isRender = (signature: ts.Signature): boolean => {
    const [props, ...rest] = signature.getParameters();
    if (rest.length > 0) return false;
    if (props !== undefined) {
      const type = checker.getTypeOfSymbolAtLocation(props, props.valueDeclaration!);
      if ((type.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) === 0) return false;
    }
    return rendersAnElement(signature.getReturnType());
  };
  const kindOf = (symbol: ts.Symbol, name: string): ExportKind => {
    const at = symbol.valueDeclaration;
    if ((symbol.flags & ts.SymbolFlags.Value) === 0 || at === undefined) return "type";
    const type = checker.getTypeOfSymbolAtLocation(symbol, at);
    const calls = type.getCallSignatures();
    if (calls.length > 0 && /^use[A-Z]/.test(name)) return "hook";
    if (type.getProperty("$$typeof") !== undefined || (calls.length > 0 && calls.every(isRender))) return "component";
    return calls.length > 0 ? "function" : "constant";
  };

  const result = entries.flatMap(({ file, subpath }) => {
    const module = checker.getSymbolAtLocation(program.getSourceFile(file)!);
    if (module === undefined) throw new Error(`\`${file}\` is not a module the compiler can read.`);
    return checker.getExportsOfModule(module).map((exported): ExportedDeclaration => {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declaration = target.declarations?.[0];
      const tags = target.getJsDocTags(checker);
      const tagText = (tag: ts.JSDocTagInfo) => ts.displayPartsToString(tag.text).trim();
      const deprecated = tags.find((tag) => tag.name === "deprecated");
      const returns = tags.find((tag) => tag.name === "returns" || tag.name === "return");
      const doc = {
        ...(subpath === undefined ? {} : { subpath }),
        kind: kindOf(target, exported.name),
        description: ts.displayPartsToString(target.getDocumentationComment(checker)).trim(),
        params: tags
          .filter((tag) => tag.name === "param")
          .map((tag) => {
            const [name = "", ...words] = tagText(tag).split(/\s+/);
            return { name, text: words.join(" ").replace(/^- /, "") };
          }),
        ...(returns === undefined ? {} : { returns: tagText(returns) }),
        ...(deprecated === undefined ? {} : { deprecated: tagText(deprecated) }),
      };
      if (declaration === undefined) return { name: exported.name, text: "", declaration: "", references: [], ...doc };
      const emittedFile = declarationsOf(declaration.getSourceFile());
      /* A symbol may have several statements (an overloaded function, an
         interface merged with a const); all of them belong to its signature. */
      const statements = emittedFile.statements.filter((statement) => declares(statement, target.name));
      /* The keywords come off the statement, never off its comment - a JSDoc
         line may well begin with "export" or say "declare". */
      const bodies = statements.map((statement) => ({
        comment: statement.getFullText().slice(0, statement.getStart() - statement.getFullStart()).trim(),
        body: statement.getText().replace(/^export /, "").replace(/^declare /, ""),
      }));
      const text = bodies.map(({ comment, body }) => (comment === "" ? body : `${comment}\n${body}`)).join("\n");
      const bare = bodies.map(({ body }) => body).join("\n");
      const renamed = target.name === exported.name ? "" : `\n// exported as ${exported.name}`;
      return { name: exported.name, text: `${text}${renamed}`, declaration: `${bare}${renamed}`, references: typeNamesIn(bare), ...doc };
    });
  });
  read.set(packageDir, result);
  return result;
}

function declares(statement: ts.Statement, name: string): boolean {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.some((one) => ts.isIdentifier(one.name) && one.name.text === name);
  }
  const named = statement as ts.Statement & { name?: ts.Node };
  return named.name !== undefined && ts.isIdentifier(named.name) && named.name.text === name;
}

/** The type names a declaration's text refers to, each once, in order. */
function typeNamesIn(text: string): string[] {
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && !found.includes(node.typeName.text)) found.push(node.typeName.text);
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile("declaration.d.ts", text, ts.ScriptTarget.Latest, true));
  return found;
}

/** The types the API index names, which need a table or a definition: every
    exported type, and every type a value's declaration names. */
export function typesOnTheIndex(declarations: readonly ExportedDeclaration[]): string[] {
  return [...new Set(declarations.flatMap((one) => (one.kind === "type" ? [one.name] : one.references)))];
}
