/* The props reader against fixture sources.

   What is checked are the three behaviours it is written by hand for - inherited
   DOM props collapse, generics stay generic, a bare prop is reported - and the
   two small things that make a table true: the type stands as it was written,
   and a default comes out of the destructuring pattern or not at all. */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readProps } from "../src/tooling/propsReader";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "props");
const GOOD = join(FIXTURES, "good.tsx");
const GAP = join(FIXTURES, "gap.tsx");
const SHAPES = join(FIXTURES, "shapes.tsx");

describe("readProps", () => {
  it("takes up its own props, with text, type and optionality", () => {
    const { types } = readProps([GOOD], ["FixtureButtonProps"]);
    const props = types.FixtureButtonProps!.props;
    expect(props.map((p) => p.name)).toEqual(["variant", "loading"]);
    expect(props[0]!.description).toBe("How loud the button is.");
    expect(props[0]!.optional).toBe(true);
  });

  it("copies the type out instead of letting it be resolved", () => {
    const { types } = readProps([GOOD], ["FixtureButtonProps"]);
    expect(types.FixtureButtonProps!.props[0]!.type).toBe('"primary" | "secondary"');
  });

  it("collapses inherited DOM props into one sentence", () => {
    const { types } = readProps([GOOD], ["FixtureButtonProps"]);
    const entry = types.FixtureButtonProps!;
    /* Not two hundred and fifty rows but two - and the rest as the element's
       name. */
    expect(entry.props).toHaveLength(2);
    expect(entry.inherits).toBe("<button>");
  });

  it("remembers what an Omit takes away from the inherited element", () => {
    const { types } = readProps([GOOD], ["FixtureTableProps"]);
    const entry = types.FixtureTableProps!;
    expect(entry.inherits).toBe("<div>");
    expect(entry.omitted).toEqual(["title"]);
  });

  it("keeps a generic parameter generic", () => {
    const { types } = readProps([GOOD], ["FixtureTableProps"]);
    const entry = types.FixtureTableProps!;
    expect(entry.parameter).toEqual(["T"]);
    /* `Column<T>[]` teaches the shape; `Column<unknown>[]` teaches nothing. */
    expect(entry.props[0]!.type).toBe("readonly FixtureColumn<T>[]");
    expect(entry.props[1]!.type).toBe("(row: T) => ReactNode");
  });

  it("takes up props from an inherited type of THIS library", () => {
    const { types } = readProps([GOOD], ["FixtureSplitProps"]);
    const entry = types.FixtureSplitProps!;
    const names = entry.props.map((p) => p.name);
    /* `variant` is omitted, `loading` comes along - and says where from. */
    expect(names).toEqual(["menu", "loading"]);
    expect(entry.props[1]!.inheritedFrom).toBe("FixtureButtonProps");
    /* The `Omit` was aimed at a type of the library and not at the element:
       it has no business in the closing sentence about `<button>`. */
    expect(entry.inherits).toBe("<button>");
    expect(entry.omitted).toEqual([]);
  });

  it("reads defaults out of the destructuring pattern - and invents none", () => {
    const { types } = readProps([GOOD], ["FixtureButtonProps", "FixtureColumn"]);
    const props = types.FixtureButtonProps!.props;
    expect(props[0]!.defaultValue).toBe('"secondary"');
    expect(props[1]!.defaultValue).toBe("false");
    /* `FixtureColumn` has no component, so no prop has a default. Making
       "empty" out of `string` would be guessing. */
    for (const prop of types.FixtureColumn!.props) {
      expect(prop.defaultValue).toBeUndefined();
    }
  });

  it("reports a prop without JSDoc, with file, line and name", () => {
    const { gaps } = readProps([GAP], ["FixtureGapProps"]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]!.prop).toBe("bar");
    expect(gaps[0]!.type).toBe("FixtureGapProps");
    expect(gaps[0]!.file).toBe(GAP);
    expect(gaps[0]!.line).toBe(7);
  });

  it("chases only what really ends up in a table", () => {
    /* `FixtureGapProps` is read but not required: "public" means that a prop
       stands in a table on some page. */
    const { gaps } = readProps([GAP, GOOD], ["FixtureButtonProps"]);
    expect(gaps).toEqual([]);
  });

  it("stops where a required type is declared nowhere", () => {
    expect(() => readProps([GOOD], ["DoesNotExist"])).toThrow(/DoesNotExist/);
  });
});

describe("readProps over a type alias as an intersection", () => {
  it("carries its own members in declaration order, with the type as it stands", () => {
    const { types } = readProps([SHAPES], ["FixtureFieldColumn", "FixtureBase", "FixturePaths"]);
    const entry = types.FixtureFieldColumn!;
    expect(entry.parameter).toEqual(["Z", "K"]);
    const own = entry.props.filter((p) => p.name === "value" || p.name === "format");
    expect(own.map((p) => [p.name, p.type])).toEqual([
      ["value", "K"],
      ["format", "FixtureFormat<Z[K]>"],
    ]);
  });

  it("names a part that has a table of its own in a sentence instead of copying it out", () => {
    /* On `Column`'s page `FieldColumn`, `ColumnBase` and `ValuePaths` stand
       one under the other. Carrying the members of the latter two in the first
       as well would mean reading the same ten rows twice. */
    const { types } = readProps([SHAPES], ["FixtureFieldColumn", "FixtureBase", "FixturePaths"]);
    const entry = types.FixtureFieldColumn!;
    expect(entry.alsoTakes).toEqual(["FixtureBase", "FixturePaths"]);
    expect(entry.props.map((p) => p.name)).not.toContain("label");
    expect(entry.props.map((p) => p.name)).not.toContain("sortValue");
  });
});

describe("readProps over the parts of a type alias that have no table of their own", () => {
  it("copies them out in declaration order", () => {
    /* Without a page for `FixtureBase` and `FixturePaths` their members stand
       in the table - where they stand in the intersection, and not behind the
       type's own. */
    const { types } = readProps([SHAPES], ["FixtureFieldColumn"]);
    expect(types.FixtureFieldColumn!.props.map((p) => p.name)).toEqual([
      "label",
      "numeric",
      "sortValue",
      "value",
      "format",
      "width",
      "children",
    ]);
  });

  it("carries a conditional helper type's member once, with the type arguments of the use", () => {
    /* `FixtureChildren<Z[K], Z>` has two branches with the same `children`.
       The table carries it once, optional because one branch carries it as
       optional, and writes the type with `Z[K]` rather than with the helper
       type's `W`, which nobody knows at this use. */
    const { types, gaps } = readProps([SHAPES], ["FixtureFieldColumn"]);
    const children = types.FixtureFieldColumn!.props.find((p) => p.name === "children")!;
    expect(children.type).toBe("(value: Z[K], row: Z) => ReactNode");
    expect(children.optional).toBe(true);
    expect(children.description).toBe("How the value appears.");
    expect(gaps).toEqual([]);
  });

  it("notes the origin only for an exported type", () => {
    /* "from FixtureBase" tells the reader something; "from FixtureHelperBase"
       names something they cannot import, and a conditional helper type is a
       mechanism, not a type. */
    const { types } = readProps([SHAPES], ["FixtureFieldColumn"]);
    const origin = Object.fromEntries(types.FixtureFieldColumn!.props.map((p) => [p.name, p.inheritedFrom]));
    expect(origin).toEqual({
      label: "FixtureBase",
      numeric: "FixtureBase",
      sortValue: "FixturePaths",
      value: undefined,
      format: undefined,
      width: undefined,
      children: undefined,
    });
  });
});

describe("readProps over a discriminated union", () => {
  it("carries the members of both arms once, and a member with two shapes in both", () => {
    /* `ActionProps` in @umriss-ui/table: with `bulk`, `onSelect` is handed a
       list and not the row. Two tables would mean reading the same label
       twice; one table with only one shape would keep the other quiet. */
    const { types, gaps } = readProps([SHAPES], ["FixtureAction"]);
    const props = types.FixtureAction!.props;
    expect(props.map((p) => [p.name, p.type, p.optional])).toEqual([
      ["children", "string", false],
      ["bulk", "false | true", true],
      ["onSelect", "((row: Z) => void) | ((rows: readonly Z[]) => void)", false],
    ]);
    expect(props.find((p) => p.name === "bulk")!.description).toBe("Acts on a list.");
    expect(props.find((p) => p.name === "onSelect")!.description).toBe("Is handed the row.");
    expect(gaps).toEqual([]);
  });
});

describe("readProps over an interface of call signatures", () => {
  it("finds no props and reports no gap", () => {
    /* `ColumnComponent` is an overload, not a props type. `Column`'s page
       explains it under "Why so" and names the types behind it; a table of six
       signatures would have no row a reader is looking for. */
    const { types, gaps } = readProps([SHAPES], ["FixtureComponent"]);
    expect(types.FixtureComponent!.props).toEqual([]);
    expect(gaps).toEqual([]);
  });
});
