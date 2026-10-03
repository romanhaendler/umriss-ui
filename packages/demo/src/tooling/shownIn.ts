/* Which example shows which row (.scratch/props-to-examples).

   The examples and scenarios are read as they are - nobody declares what an
   example teaches. One program over their files, which import the package's
   own `src` relatively, and the type checker says which property each use
   resolves to; never a pattern over the text, so `value` on a Select is never
   `value` on a Slider. A use is keyed by the declaration it resolves to
   (`declarationKey`), and a row is shown where a use meets one of the places
   the reader read it from (`Reading.declaredAt`) - so an inherited row is
   shown by a use of its parent's prop.

   What counts as a use:
   - a JSX attribute: the property it resolves to;
   - JSX children: `children` of the element's props;
   - a property of an object literal, by the literal's contextual type - a
     column, an options object, an intent, whatever a hook takes; of a union,
     the arms the literal fits;
   - a property access, and a name an object pattern takes out - an output
     type such as `table.setPage(2)`;
   - a spread attribute: the properties of the spread's own type, never
     everything the element accepts.

   It runs in Node, in the generator (`props.ts`), which is why the imports
   carry their extensions. */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { SCENARIOS, type Rubric } from "../outline.ts";
import { byRank, parseFileName, parseScenarioName } from "./fileName.ts";
import { declarationKey, type ShownIn } from "./propsReader.ts";

/** The declarations every file uses, by file. */
export function usesOf(files: readonly string[], options: ts.CompilerOptions = {}): Map<string, Set<string>> {
  const program = ts.createProgram([...files], {
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
  const found = new Map<string, Set<string>>();
  for (const file of files) {
    const source = program.getSourceFile(file);
    if (source === undefined) throw new Error(`\`${file}\` is not a file the compiler can read.`);
    const used = new Set<string>();
    const add = (symbol: ts.Symbol | undefined) => {
      for (const declaration of symbol?.declarations ?? []) used.add(declarationKey(declaration));
    };
    const property = (types: readonly ts.Type[], name: string) => {
      for (const type of types) add(checker.getPropertyOfType(type, name));
    };
    const nameOf = (name: ts.Node | undefined): string | undefined =>
      name !== undefined && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
    /** The element type of the array a literal is mapped into: of
        `options={xs.map((x) => ({ value, label }))}`, the option type - the
        callback's own context is the type `map` infers from the literal,
        which declares nothing of the package's. */
    const mappedInto = (node: ts.ObjectLiteralExpression): ts.Type | undefined => {
      let at: ts.Node = node;
      while (ts.isParenthesizedExpression(at.parent)) at = at.parent;
      if (ts.isReturnStatement(at.parent)) at = ts.findAncestor(at.parent, ts.isFunctionLike) ?? at;
      else if (ts.isArrowFunction(at.parent) && at.parent.body === at) at = at.parent;
      if (!ts.isFunctionLike(at) || !ts.isCallExpression(at.parent) || !at.parent.arguments.includes(at as ts.Expression)) return undefined;
      /* Only where the callback's context is what `map` inferred from the
         literal itself: a callback typed by its caller keeps that type. */
      const own = checker.getContextualType(node);
      if (own !== undefined && !(own.flags & ts.TypeFlags.TypeParameter) && own.symbol?.valueDeclaration !== node) return undefined;
      const array = checker.getContextualType(at.parent);
      return array === undefined ? undefined : checker.getIndexTypeOfType(checker.getNonNullableType(array), ts.IndexKind.Number);
    };
    /** What an object literal or an element's attributes are written
        against: the arms of a union the literal fits, else all of them. */
    const contextOf = (node: ts.ObjectLiteralExpression | ts.JsxAttributes): readonly ts.Type[] => {
      const contextual = ts.isObjectLiteralExpression(node) ? mappedInto(node) ?? checker.getContextualType(node) : checker.getContextualType(node);
      if (contextual === undefined) return [];
      const arms = contextual.isUnion() ? contextual.types : [contextual];
      const own = checker.getTypeAtLocation(node);
      const fitting = arms.filter((arm) => checker.isTypeAssignableTo(own, arm));
      return fitting.length > 0 ? fitting : arms;
    };
    const visit = (node: ts.Node): void => {
      if (ts.isJsxAttribute(node)) {
        const name = nameOf(node.name);
        if (name !== undefined) property(contextOf(node.parent), name);
      } else if (ts.isJsxSpreadAttribute(node)) checker.getPropertiesOfType(checker.getTypeAtLocation(node.expression)).forEach(add);
      else if (ts.isJsxElement(node) && node.children.some((child) => !ts.isJsxText(child) || !child.containsOnlyTriviaWhiteSpaces)) {
        property(contextOf(node.openingElement.attributes), "children");
      } else if (ts.isPropertyAccessExpression(node)) add(checker.getSymbolAtLocation(node.name));
      else if (ts.isObjectBindingPattern(node)) {
        const type = checker.getTypeAtLocation(node);
        for (const element of node.elements) {
          const name = nameOf(element.propertyName ?? element.name);
          if (name !== undefined) property([type], name);
        }
      } else if (ts.isObjectLiteralExpression(node)) {
        const context = contextOf(node);
        for (const member of node.properties) {
          const name = nameOf(member.name);
          if (name !== undefined) property(context, name);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    found.set(file, used);
  }
  return found;
}

/** An example or a scenario, and its file. */
interface Demonstration extends ShownIn {
  file: string;
}

/** `export const title = "…"` - the name an example goes by. */
function titleOf(file: string, source: ts.SourceFile): string {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const one of statement.declarationList.declarations) {
      if (ts.isIdentifier(one.name) && one.name.text === "title" && one.initializer !== undefined && ts.isStringLiteralLike(one.initializer)) {
        return one.initializer.text;
      }
    }
  }
  throw new Error(`\`${file}\` exports no \`title\` – without one it has no name.`);
}

const tsxIn = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".tsx")) : []);

/** A demo's examples in the order of its outline, then its scenarios. */
export function demonstrationsOf(demoDir: string, outline: readonly Rubric[]): Demonstration[] {
  const pages = outline.flatMap((rubric) => rubric.pages);
  const read = (file: string) => ts.createSourceFile(file, ts.sys.readFile(file) ?? "", ts.ScriptTarget.Latest);
  const examplesDir = join(demoDir, "examples");
  const examples = (existsSync(examplesDir) ? readdirSync(examplesDir) : [])
    .flatMap((folder) => tsxIn(join(examplesDir, folder)).map((name) => join(examplesDir, folder, name)))
    .map((file) => ({ file, ...parseFileName(file) }))
    .sort((a, b) => pages.findIndex((page) => page.id === a.pageId) - pages.findIndex((page) => page.id === b.pageId) || byRank(a, b))
    .map(({ file, pageId, id }) => ({
      file,
      page: pageId,
      example: id,
      title: titleOf(file, read(file)),
      pageName: pages.find((page) => page.id === pageId)?.name ?? pageId,
    }));
  const scenarios = tsxIn(join(demoDir, "scenarios"))
    .map((name) => join(demoDir, "scenarios", name))
    .map((file) => ({ file, ...parseScenarioName(file) }))
    .sort(byRank)
    .map(({ file, id }) => ({ file, page: SCENARIOS, example: id, title: titleOf(file, read(file)), pageName: "Scenarios" }));
  return [...examples, ...scenarios];
}

/** What the gate finds against a package's list of rows not shown yet
    (`demo/unshown.json`, `Type.prop` to a reason): a row without a use that
    is not on it, an entry whose row has a use now, an entry naming no row.
    The list can only shrink: whoever adds the example removes the line. */
export function exampleFaults(
  rows: readonly string[],
  shown: Readonly<Record<string, readonly ShownIn[]>>,
  notYet: Readonly<Record<string, string>>,
): { unshown: string[]; stale: string[]; unknown: string[] } {
  const listed = Object.keys(notYet);
  return {
    unshown: rows.filter((row) => shown[row] === undefined && !Object.hasOwn(notYet, row)),
    stale: listed.filter((row) => rows.includes(row) && shown[row] !== undefined),
    unknown: listed.filter((row) => !rows.includes(row)),
  };
}

/** Each row's demonstrations by `Type.prop`, a row without one left out: the
    examples of the page its table stands on, then the other pages' in the
    order of the outline, then the scenarios. */
export function shownIn(
  demoDir: string,
  outline: readonly Rubric[],
  declaredAt: Readonly<Record<string, readonly string[]>>,
  options: ts.CompilerOptions = {},
): Record<string, ShownIn[]> {
  const demonstrations = demonstrationsOf(demoDir, outline);
  const uses = usesOf(
    demonstrations.map((one) => one.file),
    options,
  );
  const pages = outline.flatMap((rubric) => rubric.pages);
  const out: Record<string, ShownIn[]> = {};
  for (const [row, keys] of Object.entries(declaredAt)) {
    const home = pages.find((page) => page.types.includes(row.slice(0, row.indexOf("."))))?.id;
    const shown = demonstrations.filter((one) => keys.some((key) => uses.get(one.file)!.has(key)));
    const ordered = [...shown.filter((one) => one.page === home), ...shown.filter((one) => one.page !== home)];
    if (ordered.length > 0) out[row] = ordered.map(({ page, example, title, pageName }) => ({ page, example, title, pageName }));
  }
  return out;
}
