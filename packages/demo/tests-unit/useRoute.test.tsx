// @vitest-environment jsdom
/* The route lands on the example an address names; a hash with a backslash in
   it is a plain name, and the landing must not throw on it. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRoute } from "../src/useRoute";

const addresses = {
  addressOf: (pageId: string, exampleId?: string) => `/${pageId}/${exampleId === undefined ? "" : `#${exampleId}`}`,
  fromPlace: (place: string) => ({ page: undefined, example: place.split("/").pop() }),
} as unknown as Parameters<typeof useRoute>[0];

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.replaceChildren();
});

describe("useRoute landing on an example", () => {
  it("lands on an example whose name has a backslash, without throwing", () => {
    const example = document.createElement("div");
    example.setAttribute("data-example", "a\\");
    document.body.append(example);
    window.history.replaceState(null, "", "/page/#a\\");

    expect(() => renderHook(() => useRoute(addresses))).not.toThrow();
    expect(example.hasAttribute("data-highlight")).toBe(true);
  });
});
