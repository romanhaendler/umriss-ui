/* In a filled frame a page holds as many whole lines as the scroll area has
   room for. jsdom lays nothing out: the frame answers the framed probe, a row
   is 20 px, the head and the foot are one row each, and the scroll area's
   height is the one the test sets. */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";
import { fittedLines } from "../src/fit";

interface Row {
  id: string;
  n: number;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i}`, n: i }));

function Case({ n, totals = false, onView }: { n: number; totals?: boolean; onView?: (view: object) => void }) {
  const t = useTable(rows(n), { rowKey: (r) => r.id, pageSize: 5, onViewChange: onView });
  return (
    <t.Table aria-label="Rows">
      <t.Column value="id" label="Id" rowHeader />
      <t.Column value="n" label="N" aggregate={totals ? "sum" : undefined} />
      <Pagination />
    </t.Table>
  );
}

/* A frame of definite height, rows of 20 px, a scroll area `area` px tall. */
function layout(area: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const asked = this.style.height.startsWith("calc(100% - ");
    const row = this.tagName === "TR" || this.tagName === "THEAD" || this.tagName === "TFOOT";
    const height = row ? 20 : this.hasAttribute("data-bounded") ? 40 : asked ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.querySelector(":scope > table") ? area : 0;
  });
}

const bodyRows = () => screen.getAllByRole("rowgroup")[1]!.querySelectorAll("tr:not([data-filler])").length;

afterEach(() => vi.restoreAllMocks());

describe("fittedLines", () => {
  it.each([
    [200, 20, 5, 10],
    [199, 20, 10, 10],
    [198, 20, 10, 9],
    [200, 20, 9, 10],
    [219, 20, 10, 10],
    [220, 20, 10, 11],
    [10, 20, 5, 1],
    [0, 20, 5, 1],
  ])("room %i px at pitch %i with %i held holds %i lines", (room, pitch, now, lines) => {
    expect(fittedLines(room, pitch, now)).toBe(lines);
  });
});

describe("the fitted page", () => {
  it("does not warn with three lines", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    layout(20 + 3 * 20);
    render(<Case n={100} />);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("fewer than three"))).toHaveLength(0);
  });

  it("holds the whole lines the scroll area has room for, the head counted out", () => {
    layout(20 + 12 * 20);
    render(<Case n={100} />);
    expect(bodyRows()).toBe(12);
    expect(screen.getByRole("navigation").textContent).toContain("1–12");
  });

  it("counts the totals footer as a line of the page", () => {
    layout(20 + 12 * 20 + 20);
    render(<Case n={100} totals />);
    expect(bodyRows()).toBe(12);
  });

  it("holds at least one line, and warns once that fewer than three fit", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    layout(25);
    const { rerender } = render(<Case n={100} />);
    expect(bodyRows()).toBe(1);
    rerender(<Case n={100} />);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("fewer than three"))).toHaveLength(1);
  });

  it("leaves the option's size where the frame holds exactly that page", () => {
    layout(20 + 5 * 20);
    render(<Case n={100} />);
    expect(bodyRows()).toBe(5);
  });

  it("leaves a short table at its rows", () => {
    layout(20 + 12 * 20);
    render(<Case n={3} />);
    expect(bodyRows()).toBe(3);
    expect(screen.getByRole("navigation").textContent).toContain("1–3 of 3");
  });

  it("keeps the view as the user left it: the fitted size is not a chosen one", () => {
    layout(20 + 12 * 20);
    const seen: object[] = [];
    render(<Case n={100} onView={(view) => seen.push(view)} />);
    expect(bodyRows()).toBe(12);
    expect(seen.some((view) => "pageSize" in view)).toBe(false);
  });

});
