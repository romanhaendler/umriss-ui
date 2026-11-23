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

  it("tables a props type no component reaches, and throws for one without an entry", () => {
    const entries = { LoneProps: { name: "LoneProps", parameter: [], omitted: [], props: [{ ...prop, name: "a", type: "string" }] } };
    expect(apiMd({ packageName: "@x/y", exports: [type("LoneProps")], entries })).toContain("## Other props\n\n#### props (LoneProps)\n\n- a: string");
    expect(() => apiMd({ packageName: "@x/y", exports: [type("LostProps")], entries })).toThrow(/LostProps/);
  });
});
