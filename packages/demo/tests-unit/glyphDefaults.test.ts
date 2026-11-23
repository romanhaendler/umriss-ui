/* The size `API.md` prints for a glyph is the one its code applies: the
   functions of one props type set it differently, so each is read on its own. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { readProps } from "../src/tooling/propsReader";

const file = fileURLToPath(new URL("../../core/src/lib/glyphs/index.tsx", import.meta.url));

it("reads for every exported glyph the default size its code applies", () => {
  const written = [...readFileSync(file, "utf8").matchAll(/export function (\w+Glyph)\(\{[^}]*?\bsize = (\d+)/g)].map((m) => [m[1]!, m[2]!]);
  expect(written.length).toBeGreaterThan(10);
  const exported = [...readFileSync(file, "utf8").matchAll(/export function (\w+Glyph)\(/g)].map((m) => m[1]);
  expect(written.map(([name]) => name)).toEqual(exported);
  const { types } = readProps([file], ["GlyphProps"]);
  expect(Object.fromEntries(written.map(([name]) => [name, { size: types.GlyphProps!.defaultsBy?.[name!]?.size }]))).toEqual(
    Object.fromEntries(written.map(([name, size]) => [name, { size }])),
  );
});
