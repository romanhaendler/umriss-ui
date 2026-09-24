// @vitest-environment jsdom
/* The canvas draws colours, not CSS (ADR-0021). A token written
   `light-dark(<light>, <dark>)` reads back from `getComputedStyle` as that text,
   which a canvas ignores - so the theme resolves every colour through a probe
   element and reads its computed `color`, which a browser gives as a resolved
   value in whichever scheme applies.

   jsdom resolves neither `var()` nor `light-dark()`, so the browser's part is
   played by a stub here: it resolves `color: var(--x)` on the probe the way a
   browser under the given scheme would. The real resolution is checked in the
   browser by `switching the theme changes the axis and series colours without
   a reload` (features-interaction.spec.ts). */

import { afterEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_THEME, invalidateTheme, resolveColours, resolveTheme, subscribeTheme } from "../src/theme";

const TOKENS: Record<string, string> = {
  "--uc-color-axis": "light-dark(#000000, #ffffff)",
  "--uc-series-1": "light-dark(#111111, #eeeeee)",
  "--uc-font": '"Geist Sans", system-ui',
};

function browserUnder(scheme: "light" | "dark") {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
    const computed = real(el);
    const inline = (el as HTMLElement).style?.color ?? "";
    const probed = /^var\((--[\w-]+)\)$/.exec(inline);
    return new Proxy(computed, {
      get(target, prop) {
        if (prop === "getPropertyValue") return (name: string) => TOKENS[name] ?? "";
        if (prop === "color" && probed) {
          const pair = /^light-dark\((#\w+), (#\w+)\)$/.exec(TOKENS[probed[1]!] ?? "");
          if (!pair) return "";
          const hex = scheme === "light" ? pair[1]! : pair[2]!;
          const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
          return `rgb(${r}, ${g}, ${b})`;
        }
        return Reflect.get(target, prop);
      },
    });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  invalidateTheme();
  document.body.innerHTML = "";
});

describe("resolveTheme", () => {
  it("resolves a light-dark() colour to a drawable value in the light scheme", () => {
    browserUnder("light");
    const root = document.body.appendChild(document.createElement("div"));
    const theme = resolveTheme(root);
    expect(theme.colorAxis).toBe("rgb(0, 0, 0)");
    expect(theme.series[0]).toBe("rgb(17, 17, 17)");
  });

  it("resolves the same token to its dark value in the dark scheme", () => {
    browserUnder("dark");
    const root = document.body.appendChild(document.createElement("div"));
    expect(resolveTheme(root).colorAxis).toBe("rgb(255, 255, 255)");
  });

  it("reads fonts as they stand, and falls back where a variable is missing", () => {
    browserUnder("light");
    const root = document.body.appendChild(document.createElement("div"));
    const theme = resolveTheme(root);
    expect(theme.font).toBe('"Geist Sans", system-ui');
    expect(theme.colorGrid).toBe(FALLBACK_THEME.colorGrid);
  });

  it("leaves nothing behind in the chart root", () => {
    browserUnder("light");
    const root = document.body.appendChild(document.createElement("div"));
    resolveTheme(root);
    expect(root.childNodes).toHaveLength(0);
  });
});

/* charts-alternatives 03 (C4): a canvas is not forced by the contrast mode,
   so under `forced-colors: active` the theme resolves to the system colours
   the page wears - played here by a stub, as the browser's part above. */
describe("resolveTheme under forced colours", () => {
  const SYSTEM: Record<string, string> = {
    CanvasText: "rgb(1, 1, 1)",
    Canvas: "rgb(2, 2, 2)",
    GrayText: "rgb(3, 3, 3)",
    Highlight: "rgb(4, 4, 4)",
  };

  function forcedBrowser() {
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
      const computed = real(el);
      const inline = (el as HTMLElement).style?.color ?? "";
      return new Proxy(computed, {
        get(target, prop) {
          if (prop === "getPropertyValue") return (name: string) => TOKENS[name] ?? "";
          // jsdom writes a system colour's name in lower case.
          if (prop === "color") return Object.entries(SYSTEM).find(([name]) => name.toLowerCase() === inline.toLowerCase())?.[1] ?? "";
          return Reflect.get(target, prop);
        },
      });
    });
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query === "(forced-colors: active)", addEventListener: () => undefined }) as unknown as MediaQueryList,
    );
  }

  it("resolves text, ground, grid and severities to system colours", () => {
    forcedBrowser();
    const root = document.body.appendChild(document.createElement("div"));
    const theme = resolveTheme(root);
    expect(theme.forced).toBe(true);
    expect(theme.colorText).toBe(SYSTEM.CanvasText);
    expect(theme.colorAxis).toBe(SYSTEM.CanvasText);
    expect(theme.colorBg).toBe(SYSTEM.Canvas);
    expect(theme.colorGrid).toBe(SYSTEM.GrayText);
    expect(theme.colorWarning).toBe(SYSTEM.Highlight);
    expect(theme.colorAlarm).toBe(SYSTEM.Highlight);
    expect(theme.colorOk).toBe(SYSTEM.CanvasText);
  });

  it("draws every series in the text colour - the marks tell them apart", () => {
    forcedBrowser();
    const root = document.body.appendChild(document.createElement("div"));
    const theme = resolveTheme(root);
    expect(theme.series).toHaveLength(6);
    expect(new Set(theme.series)).toEqual(new Set([SYSTEM.CanvasText]));
  });

  it("is not forced otherwise", () => {
    browserUnder("light");
    const root = document.body.appendChild(document.createElement("div"));
    expect(resolveTheme(root).forced).toBe(false);
  });
});

describe("resolveColours - the resolution for a canvas that is not a chart", () => {
  it("resolves any CSS colour through the element it is given", () => {
    browserUnder("dark");
    const root = document.body.appendChild(document.createElement("div"));
    const colours = resolveColours(root, { edge: "var(--uc-color-axis)", mark: "var(--uc-series-1)" });
    expect(colours).toEqual({ edge: "rgb(255, 255, 255)", mark: "rgb(238, 238, 238)" });
    expect(root.childNodes).toHaveLength(0);
  });

  it("gives a value back as it stands where no resolution comes back", () => {
    browserUnder("light");
    const root = document.body.appendChild(document.createElement("div"));
    expect(resolveColours(root, { plain: "var(--nowhere)" })).toEqual({ plain: "var(--nowhere)" });
  });

  it("tells a subscriber when the theme was invalidated, until it unsubscribes", () => {
    const notified = vi.fn();
    const unsubscribe = subscribeTheme(notified);
    invalidateTheme();
    expect(notified).toHaveBeenCalledTimes(1);
    unsubscribe();
    invalidateTheme();
    expect(notified).toHaveBeenCalledTimes(1);
  });
});
