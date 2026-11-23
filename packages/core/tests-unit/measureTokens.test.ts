/* What sizes with the text is rem, equal to its former px at a 16px root; two tokens have a new name and keep the old as an alias that the library's rules read. */

import { describe, expect, it } from "vitest";
import TOKENS from "../src/styles/tokens.css?raw";
import TOUCH from "../src/styles/touch-scale.css?raw";

const SHEETS = import.meta.glob("../../*/src/**/*.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const FORMER_PX: Record<string, number> = {
  "--u-space-1": 4, "--u-space-2": 8, "--u-space-3": 12, "--u-space-4": 16,
  "--u-space-5": 20, "--u-space-6": 24, "--u-space-7": 32, "--u-space-8": 40,
  "--u-icon-size": 14, "--u-icon-size-sm": 12,
  "--u-button-padding": 10, "--u-button-padding-sm": 6,
  "--u-drawer-width": 400, "--u-modal-width-sm": 400, "--u-modal-width-md": 520, "--u-modal-width-lg": 720,
  "--u-toast-width": 360,
};

const declared = (name: string) => new RegExp(`^\\s*${name}:\\s*([^;]+);`, "m").exec(TOKENS)?.[1]?.trim();

describe("measure tokens", () => {
  for (const [name, px] of Object.entries(FORMER_PX)) {
    it(`${name} is ${px}px at a 16px root`, () => {
      const value = declared(name);
      expect(value).toMatch(/^[\d.]+rem$/);
      expect(Number.parseFloat(value as string) * 16).toBe(px);
    });
  }

  it("has no extra-small control height", () => {
    expect(TOKENS).not.toMatch(/--u-control-height-xs/);
    expect(TOUCH).not.toMatch(/--u-control-height-xs/);
  });
});

describe("renamed tokens", () => {
  const RENAMED = { "--u-shadow-sticky": "--u-color-shadow-sticky", "--u-color-edge-hover": "--u-edge-color-hover" };
  const readers = (name: string) =>
    Object.entries(SHEETS)
      .filter(([path, css]) => !path.endsWith("/tokens.css") && new RegExp(`var\\(${name}(?![\\w-])`).test(css))
      .map(([path]) => path);

  for (const [old, now] of Object.entries(RENAMED)) {
    it(`${old} is declared as an alias of ${now}, and the library's rules still read the old name`, () => {
      expect(declared(old)).toBe(`var(${now})`);
      expect(declared(now)).toBeTruthy();
      expect(readers(old).length).toBeGreaterThan(0);
      expect(readers(now)).toEqual([]);
    });
  }
});
