/* A table fills a parent of definite height. jsdom lays nothing out, so the
   frame answers the browser's question - does `height: 100%` resolve? - by a
   faked box: 100 px tall, and 7 px shorter when asked to be. */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";

interface Row {
  id: string;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i}` }));


function Case({ n, maxHeight, paged = true }: { n: number; maxHeight?: string; paged?: boolean }) {
  const t = useTable(rows(n), { rowKey: (r) => r.id, pageSize: 5 });
  return (
    <t.Table aria-label="Rows" maxHeight={maxHeight}>
      <output>{String(t.framed)}</output>
      <t.Column value="id" label="Id" rowHeader />
      {paged && <Pagination />}
    </t.Table>
  );
}

/* A parent with a definite height: the frame follows a percentage style. */
function definiteParent(definite: boolean) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const asked = this.style.height.startsWith("calc(100% - ");
    const height = this.hasAttribute("data-bounded") || !definite ? 40 : asked ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("framed", () => {
  it("is true where the parent has a definite height", () => {
    definiteParent(true);
    render(<Case n={20} />);
    expect(screen.getByRole("status").textContent).toBe("true");
  });

  it("is false in a flowing parent", () => {
    definiteParent(false);
    render(<Case n={20} />);
    expect(screen.getByRole("status").textContent).toBe("false");
  });

  it("is false with maxHeight, which keeps the rows' height", () => {
    definiteParent(true);
    render(<Case n={20} maxHeight="200px" />);
    expect(screen.getByRole("status").textContent).toBe("false");
  });
});

describe("the surface under the last row", () => {
  it("has nothing to focus or announce: the rows end at the last row", () => {
    definiteParent(true);
    render(<Case n={3} />);
    const body = screen.getAllByRole("rowgroup")[1]!;
    const real = body.querySelectorAll("tr:not([data-filler])");
    expect(real).toHaveLength(3);
    for (const filler of body.querySelectorAll("tr[data-filler]")) {
      expect(filler.getAttribute("aria-hidden")).toBe("true");
      expect(filler.querySelector("button, a, input, [tabindex]")).toBeNull();
    }
  });
});
