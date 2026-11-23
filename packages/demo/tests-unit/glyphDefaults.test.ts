/* The size `API.md` prints for a glyph is the one its code applies: the
   glyphs set it differently, so each is read on its own. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("../../core/src/lib/glyphs/index.tsx", import.meta.url)), "utf8");
const apiMd = readFileSync(fileURLToPath(new URL("../../core/API.md", import.meta.url)), "utf8");

it("prints for every exported glyph the default size its code applies", () => {
  const written = [...source.matchAll(/export function (\w+Glyph)\(\{[^}]*?\bsize = (\d+)/g)].map((m) => [m[1]!, m[2]!]);
  expect(written.length).toBeGreaterThan(10);
  expect(written.map(([name]) => name)).toEqual([...source.matchAll(/export function (\w+Glyph)\(/g)].map((m) => m[1]));
  const printed = written.map(([name]) => [name, /^- size\?: number.*\(default: (\d+)\)$/m.exec(apiMd.split(`\n### ${name}\n`)[1]?.split("\n### ")[0] ?? "")?.[1]]);
  expect(printed).toEqual(written);
});
