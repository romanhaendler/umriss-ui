/* Flex widths and "Fit all columns". The layout itself - that two flex columns
   split what the fixed one leaves - is measured in the browser
   (tests-visual/flex-widths.spec.ts); here stands the share arithmetic and
   what the head and the hook say. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColumnMenu, useTable } from "../src";
import type { Table } from "../src";
import { flexShares } from "../src/flexWidths";

interface Row {
  id: string;
  a: string;
  b: string;
  c: string;
}

const ROWS: Row[] = [{ id: "1", a: "x", b: "y", c: "z" }];

let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};

function Grid() {
  const t = useTable(ROWS, { rowKey: (r) => r.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <ColumnMenu />
      <Column value="a" label="A" width={150} />
      <Column value="b" label="B" flex={1} minWidth={120} resizable />
      <Column value="c" label="C" flex={2} />
    </Frame>
  );
}

afterEach(() => vi.restoreAllMocks());

describe("flexShares", () => {
  it("splits the free width by the shares", () => {
    expect(flexShares(600, [{ flex: 1 }, { flex: 2 }])).toEqual([200, 400]);
  });

  it("holds a column at its minimum and splits the rest among the others", () => {
    expect(flexShares(300, [{ flex: 1, min: 200 }, { flex: 1 }, { flex: 1 }])).toEqual([200, 50, 50]);
  });

  it("gives every column its minimum when there is no room", () => {
    expect(flexShares(-40, [{ flex: 1, min: 80 }, { flex: 3 }])).toEqual([80, 0]);
  });
});

describe("a flex column", () => {
  it("marks its head with the share and the minimum; a column with a width has none", () => {
    const { container } = render(<Grid />);
    const b = container.querySelector<HTMLElement>('th[data-column="b"]')!;
    expect(b.dataset.flex).toBe("1");
    expect(b.style.minWidth).toBe("120px");
    expect(container.querySelector<HTMLElement>('th[data-column="a"]')!.dataset.flex).toBeUndefined();
  });

  it("ends with a hand resize, and the view stores the pixels", () => {
    const { container } = render(<Grid />);
    const b = container.querySelector<HTMLElement>('th[data-column="b"]')!;
    vi.spyOn(b, "getBoundingClientRect").mockReturnValue({ width: 100 } as DOMRect);
    const grip = b.querySelector('[role="presentation"]')!;
    act(() => {
      fireEvent.pointerDown(grip, { pointerId: 1, clientX: 10 });
      grip.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 50 }));
      grip.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, clientX: 50 }));
    });
    expect(b.dataset.flex).toBeUndefined();
    expect(current!.view.widths).toEqual({ b: 140 });
  });
});

describe("Fit all columns", () => {
  const measure = () => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(73);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.scrollWidth;
    });
  };

  it("autoSizeColumns sets every column to its content's width", () => {
    const { container } = render(<Grid />);
    measure();
    act(() => current!.autoSizeColumns());
    expect(current!.widths).toEqual({ a: 74, b: 74, c: 74 });
    expect(container.querySelector<HTMLElement>('th[data-column="c"]')!.dataset.flex).toBeUndefined();
  });

  it("the column menu does the same", () => {
    render(<Grid />);
    measure();
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Fit all columns" }));
    expect(current!.widths).toEqual({ a: 74, b: 74, c: 74 });
  });
});
