/* The scroll lock makes up the scrollbar's width in padding, except where the root's scrollbar gutter is stable. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { lockScroll, unlockScroll } from "../src/lib/scrollLock";

const root = document.documentElement;
afterEach(() => vi.restoreAllMocks());

function withBar(gutter: string) {
  Object.defineProperty(root, "clientWidth", { value: window.innerWidth - 15, configurable: true });
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    paddingRight: "0px",
    getPropertyValue: (name: string) => (name === "scrollbar-gutter" ? gutter : ""),
  } as unknown as CSSStyleDeclaration);
}

describe("lockScroll", () => {
  it("pads the root by the scrollbar's width and gives it back", () => {
    withBar("auto");
    lockScroll();
    expect(root.style.overflow).toBe("hidden");
    expect(root.style.paddingRight).toContain("15px");
    unlockScroll();
    expect(root.style.overflow).toBe("");
    expect(root.style.paddingRight).toBe("");
  });

  it("adds no padding where the scrollbar gutter is stable", () => {
    withBar("stable");
    lockScroll();
    expect(root.style.overflow).toBe("hidden");
    expect(root.style.paddingRight).toBe("");
    unlockScroll();
  });
});
