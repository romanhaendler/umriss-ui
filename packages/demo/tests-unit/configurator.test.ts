/* The configurator's two pure halves (.scratch/configurator): which control a
   prop becomes, read from the props reader's output for a fixture, and the
   code it writes for what is on screen. What the reader sees and copies -
   the panel itself is checked in the browser (core's `features-page.spec.ts`). */

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readProps } from "../src/tooling/propsReader";
import { codeOf, controlsOf, readConfigurators, startOf, type Value } from "../src/tooling/configurator";
import type { Page } from "../src/outline";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "props", "configurable.tsx");
const ENTRY = readProps([FILE], ["FixtureConfigurableProps"]).types.FixtureConfigurableProps!;
const AT = "configurators/FixtureConfigurable.tsx";

describe("controlsOf", () => {
  const control = (prop: string) => controlsOf(AT, ENTRY, { controls: [prop] })[0]!;

  it("makes a literal union of up to five members a segmented choice, with its default", () => {
    expect(control("variant")).toEqual({
      prop: "variant",
      kind: "choice",
      values: ["primary", "secondary", "ghost"],
      defaultValue: "secondary",
    });
  });

  it("makes a union of more than five a select", () => {
    expect(control("hue")).toMatchObject({ kind: "select", values: ["red", "orange", "yellow", "green", "blue", "violet"], defaultValue: "blue" });
  });

  it("takes the value a phrase default comes to as the default, and says so", () => {
    expect(control("size")).toEqual({ prop: "size", kind: "choice", values: ["sm", "md"], defaultValue: "md", inherited: true });
  });

  it("makes a boolean a switch, off where it has no default", () => {
    expect(control("loading")).toEqual({ prop: "loading", kind: "switch", defaultValue: false });
    expect(control("invalid")).toEqual({ prop: "invalid", kind: "switch", defaultValue: false });
  });

  it("makes a number a number field, with the bounds the declaration gives and a hundredth of them as its step", () => {
    expect(controlsOf(AT, ENTRY, { controls: ["count"], bounds: { count: [0, 100] } })[0]).toEqual({
      prop: "count",
      kind: "number",
      defaultValue: null,
      min: 0,
      max: 100,
      step: 1,
      decimals: 0,
    });
    expect(controlsOf(AT, ENTRY, { controls: ["count"], bounds: { count: [0, 1] } })[0]).toMatchObject({ step: 0.01, decimals: 2 });
    // A step of 2.5 is above 1 and still has a decimal place to show.
    expect(controlsOf(AT, ENTRY, { controls: ["count"], bounds: { count: [0, 250] } })[0]).toMatchObject({ step: 2.5, decimals: 1 });
  });

  it("allows `disabled` and `placeholder` from the element, and the children text first", () => {
    expect(controlsOf(AT, ENTRY, { controls: ["variant", "disabled"], children: "Save" })).toEqual([
      { prop: "children", kind: "text", defaultValue: "Save" },
      expect.objectContaining({ prop: "variant" }),
      { prop: "disabled", kind: "switch", defaultValue: false },
    ]);
  });

  it("starts a required prop at the declared value", () => {
    expect(controlsOf(AT, ENTRY, { controls: ["count"], required: { count: 40 } })[0]).toMatchObject({ defaultValue: 40 });
  });

  it("fails on a prop the table does not have, naming the file and the prop", () => {
    expect(() => control("tone")).toThrow(/configurators\/FixtureConfigurable\.tsx.*`tone`/);
  });

  it("fails on a function, naming the file and the prop", () => {
    expect(() => control("onPress")).toThrow(/configurators\/FixtureConfigurable\.tsx.*`onPress`.*cannot become a control/);
  });

  it("makes a string, a node and a string-or-number a text field, starting at the declared value, the default or empty", () => {
    expect(controlsOf(AT, ENTRY, { controls: ["label"], required: { label: "Save" } })[0]).toEqual({ prop: "label", kind: "text", defaultValue: "Save" });
    expect(control("extra")).toEqual({ prop: "extra", kind: "text", defaultValue: "" });
    expect(control("span")).toEqual({ prop: "span", kind: "text", defaultValue: "100%" });
  });

  it("makes a number that may be missing or a word a number field", () => {
    expect(control("reading")).toEqual({ prop: "reading", kind: "number", defaultValue: null });
    expect(control("width")).toEqual({ prop: "width", kind: "number", defaultValue: 96 });
  });

  it("steps by a declared third bound", () => {
    expect(controlsOf(AT, ENTRY, { controls: ["count"], bounds: { count: [0, 6, 1] } })[0]).toMatchObject({ min: 0, max: 6, step: 1, decimals: 0 });
  });

  it("takes `disabled` from the table where the component has its own, on an element without one", () => {
    const own = { ...ENTRY, inherits: "<span>", props: [...ENTRY.props, { name: "disabled", type: "boolean", optional: true, description: "", defaultValue: "false" }] };
    expect(controlsOf(AT, own, { controls: ["disabled"] })).toEqual([{ prop: "disabled", kind: "switch", defaultValue: false }]);
  });

  it("allows `placeholder` only on an element that has one", () => {
    expect(() => control("placeholder")).toThrow(/`placeholder`/);
  });
});

describe("codeOf", () => {
  const controls = controlsOf(AT, ENTRY, { controls: ["variant", "size", "loading", "count"], children: "Save" });
  const code = (values: Record<string, Value>, required = {}) =>
    codeOf("FixtureConfigurable", "@umriss-ui/core", controls, { ...startOf(controls), ...values }, required);

  it("writes the import line and the bare element at the defaults", () => {
    expect(code({})).toBe('import { FixtureConfigurable } from "@umriss-ui/core";\n\n<FixtureConfigurable>Save</FixtureConfigurable>');
  });

  it("quotes strings, braces numbers and writes `true` bare, in the panel's order", () => {
    expect(code({ loading: true, variant: "primary", count: 3 })).toBe(
      'import { FixtureConfigurable } from "@umriss-ui/core";\n\n<FixtureConfigurable variant="primary" loading count={3}>Save</FixtureConfigurable>',
    );
  });

  it("leaves out a prop back at its default, the inherited size included", () => {
    expect(code({ variant: "secondary", size: "md", loading: false })).toContain("<FixtureConfigurable>Save<");
    expect(code({ size: "sm" })).toContain('<FixtureConfigurable size="sm">');
  });

  it("closes itself without children text, and always shows a required prop", () => {
    expect(code({ children: "" }, { label: "Save the order" })).toContain('<FixtureConfigurable label="Save the order" />');
  });

  it("writes a required node as its code between the tags, and imports what that code names", () => {
    expect(code({ children: "" }, { label: "Add a stop", children: { node: null, code: "<PlusGlyph />" } })).toBe(
      'import { FixtureConfigurable, PlusGlyph } from "@umriss-ui/core";\n\n<FixtureConfigurable label="Add a stop"><PlusGlyph /></FixtureConfigurable>',
    );
  });

  it("writes text that would not stand as written as an expression", () => {
    expect(code({ children: "a <b> {c}" })).toContain('<FixtureConfigurable>{"a <b> {c}"}</FixtureConfigurable>');
  });
});

describe("readConfigurators", () => {
  it("reads a configurator named after its page against the props of the component it names", () => {
    const pages = [{ id: "typography" } as Page];
    const [read] = readConfigurators(
      { "./configurators/Typography.tsx": { name: "FixtureConfigurable", component: () => null, controls: ["variant"] } },
      { FixtureConfigurableProps: ENTRY },
      pages,
    );
    expect(read).toMatchObject({ pageId: "typography", name: "FixtureConfigurable", controls: [{ prop: "variant" }] });
  });
});
