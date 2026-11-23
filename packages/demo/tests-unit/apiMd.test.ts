/* `API.md` is built from the exports and the generated tables. That the
   checked-in files are current is `pnpm check:site`'s job (it needs the
   TypeScript program, about five seconds a package). */

import { describe, expect, it } from "vitest";
import { apiMd, firstSentence } from "../src/tooling/apiMd";

describe("firstSentence", () => {
  it("stops at the first full stop followed by a space, not at e.g.", () => {
    expect(firstSentence("Sorts, e.g. by\n two columns. Then more.")).toBe("Sorts, e.g. by two columns.");
  });
});

describe("apiMd", () => {
  it("lists exports, then the options and returns of a hook", () => {
    const exported = { text: "", references: [], params: [], description: "" };
    const text = apiMd({
      packageName: "@x/y",
      exports: [
        { ...exported, name: "useThing", kind: "hook", description: "Holds a thing. More.", declaration: "function useThing(o: ThingOptions): Thing;" },
        { ...exported, name: "Thing", kind: "type", description: "What it returns.", declaration: "" },
      ],
      entries: {
        ThingOptions: { name: "ThingOptions", parameter: [], omitted: [], props: [{ name: "size", type: "number", optional: true, defaultValue: "1", description: "How big. Really.", } ] },
        Thing: { name: "Thing", parameter: [], omitted: [], props: [{ name: "id", type: "string", optional: false, description: "Its id." }] },
      },
    });
    expect(text).toContain("- useThing — Holds a thing.");
    expect(text).toContain("- Thing — What it returns. [id]");
    expect(text).toContain("#### options (ThingOptions)\n\n- size?: number — How big. (default: 1)");
    expect(text).toContain("#### returns (Thing)\n\n- id: string — Its id.");
  });

  const exported = { text: "", references: [], params: [], description: "" };
  const prop = { optional: false, description: "" };
  const hook = { ...exported, name: "useThing", kind: "hook" as const, declaration: "function useThing(): Thing;" };
  const type = (name: string) => ({ ...exported, name, kind: "type" as const, declaration: "" });

  it("tables the props of every component a hook returns, however its type is written", () => {
    const text = apiMd({
      packageName: "@x/y",
      exports: [hook, { ...exported, name: "Part", kind: "component", declaration: "declare function Part(props: PartProps): null;" }, type("Thing"), type("MainProps"), type("PartProps"), type("OneProps")],
      entries: {
        Thing: {
          name: "Thing",
          parameter: [],
          omitted: [],
          props: [
            { ...prop, name: "Main", type: "(props: MainProps<Z>) => ReactNode" },
            { ...prop, name: "Part", type: "typeof Part" },
            { ...prop, name: "One", type: "OneComponent<Z>" },
          ],
        },
        MainProps: { name: "MainProps", parameter: [], omitted: [], props: [{ ...prop, name: "title", type: "string" }] },
        PartProps: { name: "PartProps", parameter: [], omitted: [], props: [{ ...prop, name: "from", type: "number" }] },
        OneProps: { name: "OneProps", parameter: [], omitted: [], props: [{ ...prop, name: "id", type: "string" }] },
        OneComponent: { name: "OneComponent", parameter: ["Z"], omitted: [], props: [], definition: { description: "", declaration: "interface OneComponent<Z> { (props: OneProps): ReactNode; }" } },
      },
    });
    expect(text).toContain("#### props of Main (MainProps)\n\n- title: string");
    expect(text).toContain("#### props of Part (PartProps)\n\n- from: number");
    expect(text).toContain("#### props of One (OneProps)\n\n- id: string");
  });

  it("prints a method as name(parameters): result, in a table and in a bracketed list", () => {
    const method = { ...prop, name: "exportAs", method: true as const, type: "<R>(format: Format<R>, rows?: Z[]) => R", description: "Exports." };
    const text = apiMd({
      packageName: "@x/y",
      exports: [hook, type("Ref")],
      entries: { Thing: { name: "Thing", parameter: [], omitted: [], props: [method] }, Ref: { name: "Ref", parameter: [], omitted: [], props: [method] } },
    });
    expect(text).toContain("#### returns (Thing)\n\n- exportAs<R>(format: Format<R>, rows?: Z[]): R — Exports.");
    expect(text).toContain("- Ref [exportAs<R>(format: Format<R>, rows?: Z[]): R]");
  });

  it("prints the members of a union alias after its sentence, uncut", () => {
    const union = (name: string, declaration: string) => ({ ...type(name), description: "Says.", declaration });
    const text = apiMd({
      packageName: "@x/y",
      exports: [
        union("Route", 'type Route = "curve" | "straight" | "orthogonal";'),
        union("Either", "type Either = Alpha | Beta<string>;"),
        union("Hit", 'type Hit = { readonly kind: "a"; readonly x: number } | { readonly kind: "none" } | { y: string };'),
      ],
      entries: {},
    });
    expect(text).toContain('- Route — Says. = "curve" | "straight" | "orthogonal"');
    expect(text).toContain("- Either — Says. = Alpha | Beta");
    expect(text).toContain('- Hit — Says. = { kind: "a", x } | { kind: "none" } | { y }');
  });

  it("tables a component given as several forms or an inline object, and keeps a function union whole", () => {
    const long = "((row: Row) => void) | ((selected: Selected extends true ? Row[] | AllMatching : Row[]) => void)";
    const text = apiMd({
      packageName: "@x/y",
      exports: [hook, type("Thing")],
      entries: {
        Thing: { name: "Thing", parameter: [], omitted: [], props: [{ ...prop, name: "Many", type: "ManyComponent<Z>" }, { ...prop, name: "Inline", type: "(props: {\n /** Names it. */\n label: string; size?: number }) => null" }] },
        ManyComponent: { name: "ManyComponent", parameter: [], omitted: [], props: [], definition: { description: "", declaration: "interface ManyComponent<Z> { (props: { a: string }): ReactNode; (props: Base & { b?: number; onSelect: " + long + " }): ReactNode; }" } },
        Base: { name: "Base", parameter: [], omitted: [], props: [{ ...prop, name: "id", type: "string" }] },
      },
    });
    expect(text).toContain("#### props of Many (all forms)\n\n- a: string\n- id: string\n- b?: number\n- onSelect: " + long);
    expect(text).toContain("#### props of Inline (all forms)\n\n- label: string — Names it.\n- size?: number");
  });

  it("lists what is experimental apart, and a deprecated member last", () => {
    const entries = {
      Opts: {
        name: "Opts",
        parameter: [],
        omitted: [],
        props: [
          { ...prop, name: "a", type: "string", description: "First." },
          { ...prop, name: "old", type: "string", description: "Gone soon.", deprecated: "Use `c`." },
          { ...prop, name: "c", type: "string", description: "Third.", experimental: "" },
        ],
      },
    };
    const hookOpts = { ...hook, declaration: "function useThing(o: Opts): void;" };
    const text = apiMd({ packageName: "@x/y", exports: [hookOpts, { ...type("Beta"), description: "Early.", experimental: "" }, type("Opts")], entries });
    expect(text).toContain("- a: string — First.\n- c: string — Third. (experimental)\n- old: string — Gone soon. (deprecated)");
    expect(text).toContain("## Experimental\n\n- Beta — Early.\n- Opts.c — Third.");
    expect(text.split("## Types")[1]!.split("## ")[0]).not.toContain("Beta");
    expect(apiMd({ packageName: "@x/y", exports: [hookOpts, type("Opts")], entries: { Opts: { ...entries.Opts, props: entries.Opts.props.slice(0, 2) } } })).not.toContain("## Experimental\n");
  });

  it("writes a function's signature, a constant's type and a class's public members", () => {
    const text = apiMd({
      packageName: "@x/y",
      exports: [
        { ...exported, name: "acknowledge", kind: "function", description: "Acknowledges.", declaration: "declare function acknowledge<T extends Alarm>(alarms: readonly T[], at?: Date): Result<T>;" },
        { ...exported, name: "LIMIT", kind: "constant", description: "The cap.", declaration: "declare const LIMIT: 12;" },
        { ...exported, name: "Scale", kind: "constant", description: "A scale.", declaration: "declare class Scale { private m; constructor(domain: number[]); toPx(v: number): number; readonly range: number; }" },
      ],
      entries: {},
    });
    expect(text).toContain("- acknowledge<T extends Alarm>(alarms: readonly T[], at?: Date): Result<T> — Acknowledges.");
    expect(text).toContain("- LIMIT: 12 — The cap.");
    expect(text).toContain("- Scale — A scale.\n  - constructor(domain: number[])\n  - toPx(v: number): number\n  - readonly range: number\n");
    expect(text).not.toContain("private m");
  });

  it("gives a record type's members with their types in full, and counts a huge one", () => {
    const members = (n: number) => Array.from({ length: n }, (_, i) => ({ ...prop, name: `k${i}`, type: "string" }));
    const text = apiMd({
      packageName: "@x/y",
      exports: [type("Alarm"), type("Huge")],
      entries: {
        Alarm: { name: "Alarm", parameter: [], omitted: [], props: [{ ...prop, name: "id", type: "string", description: "Its id." }, { ...prop, name: "raised", type: "number", optional: true, description: "When." }] },
        Huge: { name: "Huge", parameter: [], omitted: [], props: members(101) },
      },
    });
    expect(text).toContain("- Alarm [id, raised]");
    expect(text).toContain("## Types in full\n\n### Alarm\n\n- id: string — Its id.\n- raised?: number — When.\n");
    expect(text).toContain("### Huge\n\n101 members;");
  });

  it("tables a props type no component reaches, and throws for one without an entry", () => {
    const entries = { LoneProps: { name: "LoneProps", parameter: [], omitted: [], props: [{ ...prop, name: "a", type: "string" }] } };
    expect(apiMd({ packageName: "@x/y", exports: [type("LoneProps")], entries })).toContain("## Other props\n\n#### props (LoneProps)\n\n- a: string");
    expect(() => apiMd({ packageName: "@x/y", exports: [type("LostProps")], entries })).toThrow(/LostProps/);
  });
});
