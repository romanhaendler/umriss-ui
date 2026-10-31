// @vitest-environment jsdom
/* The chart's text sizes grow with the root size: the tokens are in rem, and the canvas reads them as pixels
   of the root it stands under. */

import { afterEach, describe, expect, it } from "vitest";
import CHARTS_CSS from "../src/styles/charts.css?raw";
import { invalidateTheme, resolveTheme } from "../src/theme";

afterEach(() => {
  document.documentElement.style.fontSize = "";
  invalidateTheme();
  document.body.innerHTML = "";
});

describe("text sizes", () => {
  it("no size token is in px", () => {
    const sizes = [...CHARTS_CSS.matchAll(/--uc-size-[\w-]+:\s*([^;]+);/g)].map((m) => m[1]);
    expect(sizes.length).toBe(4);
    expect(sizes.filter((s) => !s?.endsWith("rem"))).toEqual([]);
  });

  it("the canvas reads a size in rem against the root", () => {
    document.documentElement.style.fontSize = "32px";
    const root = document.body.appendChild(document.createElement("div"));
    root.style.setProperty("--uc-size-tick", "0.5rem");
    expect(resolveTheme(root).sizeTick).toBe(16);
  });
});
