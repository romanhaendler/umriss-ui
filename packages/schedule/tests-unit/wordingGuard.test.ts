/* Every text @umriss-ui/schedule shows comes from the wording of @umriss-ui/core
   (schedule 04) - the same guard as `packages/core/tests-unit/
   wordingSource.test.ts`, over the sources of this package. Reading goes
   through the TypeScript parser: what is reported are text nodes, strings as a
   prop and strings directly in a JSX expression that look like a German word. */

import ts from "typescript";
import { describe, expect, it } from "vitest";

const SOURCES = import.meta.glob("../src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** A word that looks German: a capital, then at least three lower-case letters -
    at the start of a word, otherwise `currentColor` would be a hit. */
const WORD = /(?<![A-Za-zÄÖÜäöüß0-9])[A-ZÄÖÜ][a-zäöüß]{3,}/;

/** Named exceptions as "file: text". Begins empty and is meant to stay that
    way; an entry here needs a reason beside it. */
const EXCEPTIONS: readonly string[] = [];

/** The strings an expression yields immediately - through parentheses, a
    conditional and `??`/`||`/`&&`, but into no call and no function. */
function stringsOf(expression: ts.Expression): string[] {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return [expression.text];
  if (ts.isTemplateExpression(expression)) {
    return [expression.head.text, ...expression.templateSpans.map((s) => s.literal.text)];
  }
  if (ts.isParenthesizedExpression(expression)) return stringsOf(expression.expression);
  if (ts.isConditionalExpression(expression)) {
    return [...stringsOf(expression.whenTrue), ...stringsOf(expression.whenFalse)];
  }
  if (ts.isBinaryExpression(expression)) {
    const kind = expression.operatorToken.kind;
    if (
      kind === ts.SyntaxKind.QuestionQuestionToken ||
      kind === ts.SyntaxKind.BarBarToken ||
      kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return [...stringsOf(expression.left), ...stringsOf(expression.right)];
    }
  }
  return [];
}

/** The hits of a file as "file:line: text". */
export function findings(file: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const report = (node: ts.Node, text: string) => {
    if (!WORD.test(text)) return;
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    found.push(`${file}:${line}: ${text.trim()}`);
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
  return found;
}

describe("Sources of @umriss-ui/schedule", () => {
  it("finds any sources at all", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(1);
  });

  it("show no German text past the wording", () => {
    const found = Object.entries(SOURCES)
      .flatMap(([file, text]) => findings(file.replace("../src/", ""), text))
      .filter((hit) => !EXCEPTIONS.some((exception) => hit.replace(/:\d+:/, ":") === exception));
    expect(found).toEqual([]);
  });
});
