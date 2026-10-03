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
    expect(entry.parameter).toEqual(["Z", "K extends keyof Z"]);
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

describe("readProps over JSDoc tags", () => {
  const TAGS = join(FIXTURES, "tags.tsx");
  const byName = () =>
    Object.fromEntries(readProps([TAGS], ["FixtureTaggedProps"]).types.FixtureTaggedProps!.props.map((p) => [p.name, p]));

  it("reads `@default` as the default, and a phrase as a phrase", () => {
    const props = byName();
    expect(props.pageSize!.defaultValue).toBe("10");
    expect(props.pageSize!.defaultIsPhrase).toBeUndefined();
    expect(props.pageSize!.description).toBe("How many rows a page holds.");
    expect(props.size!.defaultValue).toBe('the size of a `SizeProvider`, else `"md"`');
    expect(props.size!.defaultIsPhrase).toBe(true);
  });

  it("takes a `@default` that agrees with the destructuring pattern", () => {
    expect(byName().tone!.defaultValue).toBe('"neutral"');
  });

  it("reads `@deprecated` with its sentence, and drops `@remarks` and `@since`", () => {
    const props = byName();
    expect(props.match!.deprecated).toBe("Is called `filter` now; the old name goes with the next minor version.");
    expect(props.match!.description).toBe("The old name of `filter`.");
    expect(props.filter!.deprecated).toBeUndefined();
    expect(props.filter!.description).toBe("Which rows the table has.");
    expect(JSON.stringify(props.filter)).not.toMatch(/since|0\.3|Never part/);
  });

  it("keeps `@deprecated` where only one arm of a union carries it", () => {
    const { types } = readProps([TAGS], ["FixtureRenamed"]);
    const footer = types.FixtureRenamed!.props.find((p) => p.name === "footer")!;
    expect(footer.deprecated).toBe("Is called `aggregate` now.");
    expect(footer.description).toBe("The old name of `aggregate`.");
  });

  it("stops where `@default` and the destructuring pattern disagree, with file, line and both values", () => {
    expect(() => readProps([TAGS], ["FixtureConflictProps"])).toThrow(/tags\.tsx:45 .*pageSize.*`10`.*`20`/);
  });
});

describe("readProps over a component that unpacks its props in its body", () => {
  const BODY = join(FIXTURES, "body.tsx");
  const TWIN = join(FIXTURES, "bodyTwin.tsx");

  it("reads `const { … } = props` as it reads the parameter list", () => {
    /* `Chart`, the series, the axes and the limits of @umriss-ui/charts. */
    const { types } = readProps([BODY], ["FixtureMarkProps"]);
    const defaults = Object.fromEntries(types.FixtureMarkProps!.props.map((p) => [p.name, p.defaultValue]));
    expect(defaults).toEqual({ strokeWidth: "1.5", padding: "8", zoneLines: "true", gap: "4", axisId: '"x"' });
  });

  it("lets a tag name the value of a constant the pattern names", () => {
    /* `laneHeight = DEFAULT_LANE_HEIGHT` in @umriss-ui/schedule, tagged `44`:
       the reader cannot import the constant, the value it can read. */
    const { types } = readProps([BODY], ["FixtureMarkProps"]);
    expect(types.FixtureMarkProps!.props.find((p) => p.name === "gap")!.defaultValue).toBe("4");
  });

  it("stops where a body default and `@default` disagree, with file and line", () => {
    expect(() => readProps([BODY], ["FixtureBodyConflictProps"])).toThrow(/body\.tsx:35 .*padding.*`4`.*`8`/);
  });

  it("gives each of two same-named private interfaces its own members", () => {
    /* `CommonProps` of the axes and of the limits in @umriss-ui/charts: a
       name means the declaration it refers to in its own file. */
    const { types } = readProps([BODY, TWIN], ["FixtureMarkProps", "FixtureLimitProps"]);
    expect(types.FixtureMarkProps!.props.map((p) => p.name)).toEqual(["strokeWidth", "padding", "zoneLines", "gap", "axisId"]);
    expect(types.FixtureLimitProps!.props.map((p) => p.name)).toEqual(["severity", "value"]);
  });
});

describe("readProps over a union whose arms forbid a member", () => {
  /* `FieldColumn` in @umriss-ui/table: `aggregate` and its old name `footer`,
     each `never` in the other's arm. A `never` is a prohibition, not a shape. */
  const read = () => readProps([SHAPES], ["FixtureMeasure", "FixtureTotals"]);
  const row = (name: string) => read().types.FixtureMeasure!.props.find((p) => p.name === name);

  it("types a member by the arms that give it a type, and keeps the prohibition's sentence after theirs", () => {
    expect(row("total")).toMatchObject({
      type: "(values: readonly Z[K][]) => Z[K]",
      description: "What the values come to. Not together with `sum`, its old name.",
      inheritedFrom: "FixtureTotals",
    });
    expect(row("sum")).toMatchObject({
      type: "FixtureFormat<Z[K]>",
      description: "The old name of `total` – not together with it.",
    });
    expect(read().gaps).toEqual([]);
  });

  it("leaves out a member that is `never` in every arm", () => {
    expect(row("legacy")).toBeUndefined();
  });

  it("writes an inherited member in the parameters of the table it stands in", () => {
    /* `FixtureDraft<Z[K], Z>`: its `W` is nobody's parameter here. */
    expect(row("validate")!.type).toBe("(value: Z[K], row: Z) => string");
  });

  it("shows each parameter with its constraint and its default", () => {
    expect(read().types.FixtureMeasure!.parameter).toEqual(["Z", "K extends keyof Z = keyof Z"]);
  });

  it("stops at a member that names a parameter its header does not introduce", () => {
    expect(() => readProps([SHAPES], ["FixtureLoose"])).toThrow(/FixtureLoose\.validate.*`Z`/);
  });
});

describe("readProps over a named alias in a type cell", () => {
  /* `ButtonSize` in @umriss-ui/core: an alias of `ControlSize`, which is
     `"sm" | "md"` - the name stays, and the values stand beneath it. */
  const row = (name: string) =>
    readProps([join(FIXTURES, "aliases.tsx")], ["FixtureAliasProps"]).types.FixtureAliasProps!.props.find((p) => p.name === name)!;

  it("keeps the name of an alias that comes over two hops to a literal union, and carries its values", () => {
    expect(row("size")).toMatchObject({ type: "FixtureButtonSize", expansion: '"sm" | "md"' });
  });

  it("carries the values of an array of one", () => {
    expect(row("steps")).toMatchObject({ type: "FixtureStep[]", expansion: "1 | 2 | 3" });
  });

  it("expands no alias of an interface, no union with a member that is no literal, and no inline union", () => {
    expect(row("shape").expansion).toBeUndefined();
    expect(row("format").expansion).toBeUndefined();
    expect(row("tone").type).toBe('"quiet" | "loud"');
    expect(row("tone").expansion).toBeUndefined();
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
