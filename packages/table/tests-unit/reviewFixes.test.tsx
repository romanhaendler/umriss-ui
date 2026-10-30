/* Pager focus, the grouped page range. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";

interface Row {
  id: string;
  g: string;
}

const rows = (n: number, groups = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i}`, g: `G${i % groups}` }));

function Case({ n, groups = 1, grouped = false, pageSize = 5 }: { n: number; groups?: number; grouped?: boolean; pageSize?: number }) {
  const t = useTable(rows(n, groups), { rowKey: (r) => r.id, pageSize, defaultGrouping: grouped ? ["g"] : undefined });
  return (
    <t.Table aria-label="Rows">
      <t.Column value="id" label="Id" rowHeader />
      <t.Column value="g" label="G" />
      <Pagination />
    </t.Table>
  );
}

const focused = () => (document.activeElement as HTMLElement).getAttribute("aria-label");

describe("the pager", () => {
  it.each(["Last page", "Next page"])("keeps focus in the group when %s lands on the edge", (label) => {
    render(<Case n={10} />);
    const button = screen.getByRole("button", { name: label });
    button.focus();
    fireEvent.click(button);
    expect(focused()).toBe("Previous page");
  });

  it("moves focus on from First page to Next page", () => {
    render(<Case n={10} />);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    const first = screen.getByRole("button", { name: "First page" });
    first.focus();
    fireEvent.click(first);
    expect(focused()).toBe("Next page");
  });
});

describe("the page range", () => {
  it("counts rows on a flat page", () => {
    render(<Case n={12} />);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(screen.getByRole("navigation").textContent).toContain("11–12 of 12");
  });

  it("counts rows, not lines, on a grouped page", () => {
    render(<Case n={100} groups={10} grouped pageSize={10} />);
    const range = () => {
      const [, from, to] = /^(\d+)–(\d+) of 100/.exec(screen.getByRole("navigation").textContent!)!.map(Number);
      return [from!, to!] as const;
    };
    let end = 0;
    for (let step = 0; step < 30; step++) {
      const [from, to] = range();
      expect(from).toBe(end + 1);
      expect(to).toBeGreaterThanOrEqual(from);
      end = to;
      const next = screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement;
      if (next.disabled) break;
      fireEvent.click(next);
    }
    expect(end).toBe(100);
  });
});
