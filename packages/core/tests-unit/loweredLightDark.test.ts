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

  /* jsdom lacks what the check reads, so it is stubbed as a browser shows it: the page's computed scheme, a
     stylesheet naming Lightning's light switch when the build is lowered, and the probe's background, which is
     transparent while the dark switch is off (the page is dark from JavaScript only). */
  const setup = async (opts: { scheme: () => string; lowered: boolean; darkSwitchOn?: boolean }) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          colorScheme: opts.scheme(),
          backgroundColor: opts.darkSwitchOn ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0)",
        }) as unknown as CSSStyleDeclaration,
    );
    const rule = { cssText: ":root { --lightningcss-light: initial; --lightningcss-dark: ; }" };
    const plain = { cssText: ".a { color: red; }" };
    Object.defineProperty(document, "styleSheets", {
      configurable: true,
      value: [{ cssRules: opts.lowered ? [plain, { cssText: ".b { color: var(--lightningcss-light, #fafafa) var(--lightningcss-dark, #0f0f10); }" }, rule] : [plain] }],
    });
    const { warnLoweredLightDark } = await import("../src/lib/dev");
    warnLoweredLightDark();
    warnLoweredLightDark();
    return warn;
  };

  /* First: an earlier case's observer would outlive its module and warn again on this root. */
  it("warns once when dark is switched on after mount, and not before", async () => {
    let scheme = "normal";
    const warn = await setup({ scheme: () => scheme, lowered: true });
    expect(warn).not.toHaveBeenCalled();
    scheme = "dark";
    document.documentElement.setAttribute("data-mode", "dark");
    await new Promise((r) => setTimeout(r, 0));
    document.documentElement.setAttribute("data-mode", "dark2");
    await new Promise((r) => setTimeout(r, 0));
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns once, naming both fixes, for a lowered build on a page made dark from JavaScript", async () => {
    const warn = await setup({ scheme: () => "dark", lowered: true });
    expect(warn).toHaveBeenCalledTimes(1);
    const text = String(warn.mock.calls[0]?.[0]);
    expect(text).toContain("color-scheme: dark");
    expect(text).toContain("cssTarget");
  });

  it("is silent for a lowered build whose dark was set in CSS, an unlowered build (a themed token included), and a light page", async () => {
    expect(await setup({ scheme: () => "dark", lowered: true, darkSwitchOn: true })).not.toHaveBeenCalled();
    expect(await setup({ scheme: () => "dark", lowered: false })).not.toHaveBeenCalled();
    expect(await setup({ scheme: () => "normal", lowered: true })).not.toHaveBeenCalled();
    expect(await setup({ scheme: () => "light dark", lowered: true })).not.toHaveBeenCalled();
  });
});
