/* Every text a component shows comes out of the wording (library-audit 03).

   The rule had held for a long time - `lib/language/wording.ts` opens with it -
   and "Zurücksetzen" and "Fertig" still stood as literals in the table filter.
   No test could see that: the seam is checked, the places that go around it are
   not.

   The source is read the way contrast.test.ts reads the stylesheet, and through
   the TypeScript parser rather than with a regular expression:
   `useState<Date>(() => …)` looks to an expression between `>` and `<` exactly
   like a text node. Reported are text nodes, strings as a prop and strings
   directly in a JSX expression - not every string in a body, else an
   `event.key === "Enter"` in a handler would report a find.

   The German words in the fixtures below are the subject of the test, not
   prose: the reader has to find them. */

import ts from "typescript";
import { describe, expect, it } from "vitest";

const SOURCES = import.meta.glob("../src/components/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** A word that looks German: upper case, then at least three lower case - at
    the start of a word, else `currentColor` is a find. */
const WORD = /(?<![A-Za-zÄÖÜäöüß0-9])[A-ZÄÖÜ][a-zäöüß]{3,}/;

/** Named exceptions as "file: text". Begins empty and should stay that way; an
    entry here needs a reason beside it. */
const EXCEPTIONS: readonly string[] = [];

/** The strings an expression yields immediately - through parentheses, a
    conditional and `??`/`||`/`&&`, but into no call and no function. */
function stringsOf(expr: ts.Expression): string[] {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return [expr.text];
  if (ts.isTemplateExpression(expr)) {
    return [expr.head.text, ...expr.templateSpans.map((s) => s.literal.text)];
  }
  if (ts.isParenthesizedExpression(expr)) return stringsOf(expr.expression);
  if (ts.isConditionalExpression(expr)) {
    return [...stringsOf(expr.whenTrue), ...stringsOf(expr.whenFalse)];
  }
  if (ts.isBinaryExpression(expr)) {
    const kind = expr.operatorToken.kind;
    if (
      kind === ts.SyntaxKind.QuestionQuestionToken ||
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return [...stringsOf(expr.left), ...stringsOf(expr.right)];
    }
  }
  return [];
}

/** A file's finds as "file:line: text". */
export function findings(file: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const finds: string[] = [];
  const report = (node: ts.Node, text: string) => {
    if (!WORD.test(text)) return;
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    finds.push(`${file}:${line}: ${text.trim()}`);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      report(node, node.text);
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      report(node, node.initializer.text);
    } else if (ts.isJsxExpression(node) && node.expression) {
      for (const text of stringsOf(node.expression)) report(node, text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return finds;
}

describe("The reader itself", () => {
  it("finds a text node, a prop and an expression", () => {
    const finds = findings(
      "sample.tsx",
      `export const A = () => (
         <div aria-label="Suchen">
           <Button>Zurücksetzen</Button>
           {offen ? "Schließen" : null}
         </div>
       );`,
    );
    expect(finds).toHaveLength(3);
  });

  it("reports neither type arguments nor strings in handlers", () => {
    const finds = findings(
      "sample.tsx",
      `export function A() {
         const [d] = useState<Date>(() => new Date());
         return <input onKeyDown={(e) => { if (e.key === "Enter") los(); }} className="feld" />;
       }`,
    );
    expect(finds).toEqual([]);
  });
});

describe("Components", () => {
  it("find any sources at all", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(30);
  });

  it("show no German text around the wording", () => {
    const finds = Object.entries(SOURCES)
      .flatMap(([file, text]) => findings(file.replace("../src/components/", ""), text))
      .filter((find) => !EXCEPTIONS.some((exception) => find.replace(/:\d+:/, ":") === exception));
    expect(finds).toEqual([]);
  });
});
