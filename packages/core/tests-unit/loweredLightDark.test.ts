/* A lowered light-dark() on a dark page: the tokens read as their light half, and development says so once. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("warnLoweredLightDark", () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.removeAttribute("data-mode");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* The page's computed colour scheme and the colour the background token resolves to: `light` for a probe that
     forces the light scheme, `page` for one that inherits the page's. */
  const setup = async (colorScheme: () => string, light: string, page: string) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (el) =>
        ({
          colorScheme: colorScheme(),
          backgroundColor: (el as HTMLElement).style.colorScheme === "light" ? light : page,
        }) as unknown as CSSStyleDeclaration,
    );
    const { warnLoweredLightDark } = await import("../src/lib/dev");
    warnLoweredLightDark();
    warnLoweredLightDark();
    return warn;
  };

  /* First: an earlier case's observer would outlive its module and warn again on this root. */
  it("warns once when dark is switched on after mount, and not before", async () => {
    let scheme = "normal";
    const warn = await setup(() => scheme, "rgb(250, 250, 250)", "rgb(250, 250, 250)");
    expect(warn).not.toHaveBeenCalled();
    scheme = "dark";
    document.documentElement.setAttribute("data-mode", "dark");
    await new Promise((r) => setTimeout(r, 0));
    document.documentElement.setAttribute("data-mode", "dark2");
    await new Promise((r) => setTimeout(r, 0));
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns once, naming both fixes, for a dark page whose lowered token stays light", async () => {
    const warn = await setup(() => "dark", "rgb(250, 250, 250)", "rgb(250, 250, 250)");
    expect(warn).toHaveBeenCalledTimes(1);
    const text = String(warn.mock.calls[0]?.[0]);
    expect(text).toContain("color-scheme: dark");
    expect(text).toContain("cssTarget");
  });

  it("is silent where the token follows the mode (modern target, CSS-set dark, a themed pair), or the page is light", async () => {
    expect(await setup(() => "dark", "rgb(250, 250, 250)", "rgb(15, 15, 16)")).not.toHaveBeenCalled();
    expect(await setup(() => "normal", "rgb(250, 250, 250)", "rgb(250, 250, 250)")).not.toHaveBeenCalled();
    expect(await setup(() => "light dark", "rgb(250, 250, 250)", "rgb(250, 250, 250)")).not.toHaveBeenCalled();
  });
});
