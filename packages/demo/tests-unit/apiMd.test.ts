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
});
