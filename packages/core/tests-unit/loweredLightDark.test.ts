/* A lowered light-dark() on a dark page: the tokens read as their light half, and development says so once. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("warnLoweredLightDark", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const run = async (colorScheme: string, bg: string) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      colorScheme,
      getPropertyValue: (name: string) => (name === "--u-color-bg" ? bg : ""),
    } as unknown as CSSStyleDeclaration);
    const { warnLoweredLightDark } = await import("../src/lib/dev");
    warnLoweredLightDark();
    warnLoweredLightDark();
    return warn;
  };

  it("warns once, naming both fixes, for a dark page whose lowered tokens stay light", async () => {
    const warn = await run("dark", "#fafafa ");
    expect(warn).toHaveBeenCalledTimes(1);
    const text = String(warn.mock.calls[0]?.[0]);
    expect(text).toContain("color-scheme: dark");
    expect(text).toContain("cssTarget");
  });

  it("is silent where the tokens are not lowered, were flipped by CSS, or the page is light", async () => {
    expect(await run("dark", "light-dark(#fafafa, #0f0f10)")).not.toHaveBeenCalled();
    expect(await run("dark", "#0f0f10")).not.toHaveBeenCalled();
    expect(await run("normal", "#fafafa")).not.toHaveBeenCalled();
    expect(await run("light dark", "#fafafa")).not.toHaveBeenCalled();
  });
});
