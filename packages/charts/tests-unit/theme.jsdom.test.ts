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
import { FALLBACK_THEME, invalidateTheme, resolveTheme } from "../src/theme";

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
