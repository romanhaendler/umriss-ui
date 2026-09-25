/* The breadcrumb at the seam a caller has (core-foundations 06): a navigation
   landmark with an ordered list, the current page marked, links and buttons
   as the caller gives them - and the fold of the middle levels into a menu,
   first as the arithmetic over measured widths and then as what a keyboard
   meets. jsdom has no layout, so the widths are handed in through the two
   getters the component reads; the real fold at a narrow window is checked in
   the browser (features-basics.spec.ts). */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Breadcrumb } from "../src";
import type { BreadcrumbEntry } from "../src";
import { foldedCount } from "../src/components/Breadcrumb/fold";

describe("foldedCount", () => {
  it("folds nothing where the whole trail fits, gaps included", () => {
    expect(foldedCount([50, 50, 50], 20, 4, 158)).toBe(0);
  });

  it("folds from the root side, one level at a time", () => {
    // Whole: 5 × 60 + 4 × 4 = 316. First + more + last three: 60 + 20 + 180 + 4 × 4 = 276.
    expect(foldedCount([60, 60, 60, 60, 60], 20, 4, 300)).toBe(1);
    expect(foldedCount([60, 60, 60, 60, 60], 20, 4, 276)).toBe(1);
    expect(foldedCount([60, 60, 60, 60, 60], 20, 4, 275)).toBe(2);
  });

  it("folds everything in between when nothing else fits, and never the ends", () => {
    expect(foldedCount([60, 60, 60, 60, 60], 20, 4, 10)).toBe(3);
  });

  it("does not fold a trail of two", () => {
    expect(foldedCount([500, 500], 20, 4, 100)).toBe(0);
  });
});

const TRAIL: BreadcrumbEntry[] = [
  { label: "Plant Nord", href: "#/plant" },
  { label: "Hall B", href: "#/hall-b" },
  { label: "Line 3", href: "#/line-3" },
  { label: "Filler F1", href: "#/filler" },
  { label: "Valve 12" },
];

describe("Breadcrumb", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is a navigation landmark with an ordered list, the last level the current page", () => {
    render(<Breadcrumb items={TRAIL} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const items = nav.querySelectorAll("ol:not([aria-hidden]) > li");
    expect(items).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Hall B" }).getAttribute("href")).toBe("#/hall-b");
    expect(document.querySelector("[aria-current=\"page\"]")?.textContent).toBe("Valve 12");
  });

  it("keeps a link as the current page where the caller gives it one", () => {
    render(<Breadcrumb items={[{ label: "Plant", href: "#/" }, { label: "Line 3", href: "#/line-3" }]} />);
    expect(screen.getByRole("link", { name: "Line 3" }).getAttribute("aria-current")).toBe("page");
  });

  it("hands routing to the caller: onSelect instead of the browser's navigation", () => {
    const selected = vi.fn();
    render(<Breadcrumb items={[{ label: "Plant", href: "#/", onSelect: selected }, { label: "Line 3" }]} />);
    const link = screen.getByRole("link", { name: "Plant" });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(click.defaultPrevented).toBe(true);
  });

  it("renders a level without an address as a button", () => {
    const selected = vi.fn();
    render(<Breadcrumb items={[{ label: "Plant", onSelect: selected }, { label: "Line 3" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Plant" }));
    expect(selected).toHaveBeenCalledTimes(1);
  });

  /* The widths as the browser would measure them: every level of the hidden
     copy 100 pixels, the menu's key 30, the trail 380 wide. Five levels need
     500 and the gaps; the first, the key and the last two need 330. */
  function measured() {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      if (this.hasAttribute("data-measure-more")) return 30;
      return this.hasAttribute("data-measure-level") ? 100 : 0;
    });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.tagName === "NAV" ? 380 : 0;
    });
  }

  it("folds the middle levels into a menu when narrow, and keeps the ends", () => {
    measured();
    render(<Breadcrumb items={TRAIL} />);
    expect(screen.getByRole("link", { name: "Plant Nord" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Hall B" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Line 3" })).toBeNull();
    expect(screen.getByRole("link", { name: "Filler F1" })).toBeTruthy();
    expect(document.querySelector("[aria-current=\"page\"]")?.textContent).toBe("Valve 12");
    expect(screen.getByRole("button", { name: "Show the levels in between" })).toBeTruthy();
  });

  it("opens the folded levels as a menu and walks it by keyboard", () => {
    measured();
    const selected = vi.fn();
    render(<Breadcrumb items={TRAIL.map((item, i) => (i === 2 ? { ...item, onSelect: selected } : item))} />);
    fireEvent.click(screen.getByRole("button", { name: "Show the levels in between" }));
    const entries = screen.getAllByRole("menuitem");
    expect(entries.map((e) => e.textContent)).toEqual(["Hall B", "Line 3"]);
    expect(document.activeElement).toBe(entries[0]);
    fireEvent.keyDown(entries[0]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(entries[1]);
    fireEvent.click(entries[1]!);
    expect(selected).toHaveBeenCalledTimes(1);
  });
});
