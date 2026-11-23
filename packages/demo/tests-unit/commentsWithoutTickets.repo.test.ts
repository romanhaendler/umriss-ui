/* A comment says what the code does and why. It names no finished ticket: the folder that
   held the ticket is deleted when its last ticket is done, so a comment that points into it
   points nowhere. The scan reads the comments themselves, not the strings or the regular
   expressions that name the same folder. */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TREES = /^(packages\/[^/]+\/(src|demo|tests-[^/]+)\/.+|scripts\/.+)\.(ts|tsx|mjs|js|css)$/;
const CITED = ".scratch";

function comments(file: string, text: string): string[] {
  if (file.endsWith(".css")) return text.match(/\/\*[\s\S]*?\*\//g) ?? [];
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const found = new Set<string>();
  const visit = (node: ts.Node) => {
    for (const range of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []) found.add(text.slice(range.pos, range.end));
    for (const range of ts.getTrailingCommentRanges(text, node.getEnd()) ?? []) found.add(text.slice(range.pos, range.end));
    for (const child of node.getChildren(source)) visit(child);
  };
  visit(source);
  return [...found];
}

it("no comment in the source, demo, test or script trees cites a finished ticket's folder", () => {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 })
    .split("\0")
    .filter((file) => TREES.test(file));
  const cited = files.flatMap((file) =>
    comments(file, readFileSync(join(ROOT, file), "utf8"))
      .filter((comment) => comment.includes(CITED))
      .map((comment) => `${file}: ${comment.split("\n")[0]}`),
  );
  expect(files.length).toBeGreaterThan(100);
  expect(cited).toEqual([]);
});
