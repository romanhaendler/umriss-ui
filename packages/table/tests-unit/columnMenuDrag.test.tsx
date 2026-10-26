/* Dragging a column by its grip in the ColumnMenu's list. jsdom has no layout:
   the entries' boxes are stubbed - 20 px high, 24 px apart, from the top of the
   list - and the pointer is placed by hand. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColumnMenu, useTable } from "../src";

const ROWS = [{ id: "r", a: 1, b: 2, c: 3, d: 4, tag: "T", z: "Z" }];

function Plant({ onViewChange }: { onViewChange?: () => void }) {
  const t = useTable(ROWS, { rowKey: (r) => r.id, onViewChange });
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <ColumnMenu />
      <Column value="a" label="A" />
      <Column value="b" label="B" />
      <Column value="c" label="C" />
      <Column value="d" label="D" />
      <Column value="tag" label="Tag" pin="start" />
      <Column value="z" label="Z" pin="end" />
    </Frame>
  );
}

const header = (root: HTMLElement) => Array.from(root.querySelectorAll("thead th")).map((c) => c.textContent);
const entries = () => Array.from(document.querySelectorAll<HTMLElement>("li[data-column]"));
const grip = (label: string) => entries().find((e) => e.textContent?.includes(label))!.querySelector<HTMLElement>("[data-grip]")!;

/* Entry i spans 24i .. 24i + 20 in the list; the list starts at 0. */
function stubBoxes() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const index = entries().indexOf(this);
    const top = index < 0 ? 0 : index * 24;
    return { top, bottom: top + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: top, toJSON: () => ({}) };
  });
  HTMLElement.prototype.setPointerCapture = () => {};
}

function open() {
  const view = render(<Plant onViewChange={onView} />);
  fireEvent.click(screen.getByRole("button", { name: "Columns" }));
  stubBoxes();
  return view;
}

const onView = vi.fn();
afterEach(() => {
  vi.restoreAllMocks();
  onView.mockClear();
});

/* The entries stand Tag, A, B, C, D, Z: the fourth of the middle block is D. */
const drag = (label: string, from: number, to: number) => {
  const g = grip(label);
  fireEvent.pointerDown(g, { pointerId: 1, button: 0, clientY: from });
  fireEvent.pointerMove(g, { pointerId: 1, clientY: to });
  return g;
};

describe("the column drag", () => {
  it("drops the fourth column of the block in the first place with one change, and the header follows", () => {
    const { container } = open();
    onView.mockClear();
    const g = drag("D", 4 * 24 + 10, 1 * 24 - 5);
    fireEvent.pointerUp(g, { pointerId: 1, clientY: 1 * 24 - 5 });
    expect(onView).toHaveBeenCalledTimes(1);
    expect(header(container)).toEqual(["Tag", "D", "A", "B", "C", "Z"]);
  });

  it("stops at the edge of the pin block", () => {
    const { container } = open();
    const g = drag("D", 4 * 24 + 10, -200);
    fireEvent.pointerUp(g, { pointerId: 1, clientY: -200 });
    expect(header(container)).toEqual(["Tag", "D", "A", "B", "C", "Z"]);
    const h = drag("A", 2 * 24 + 10, 900);
    fireEvent.pointerUp(h, { pointerId: 1, clientY: 900 });
    expect(header(container)).toEqual(["Tag", "D", "B", "C", "A", "Z"]);
  });

  it("leaves the order alone on Escape and keeps the menu open", () => {
    const { container } = open();
    onView.mockClear();
    const g = drag("D", 4 * 24 + 10, 0);
    fireEvent.keyDown(document.body, { key: "Escape" });
    fireEvent.pointerUp(g, { pointerId: 1, clientY: 0 });
    expect(onView).not.toHaveBeenCalled();
    expect(header(container)).toEqual(["Tag", "A", "B", "C", "D", "Z"]);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("leaves the order alone on pointercancel", () => {
    const { container } = open();
    onView.mockClear();
    const g = drag("D", 4 * 24 + 10, 0);
    fireEvent.pointerCancel(g, { pointerId: 1 });
    fireEvent.pointerUp(g, { pointerId: 1, clientY: 0 });
    expect(onView).not.toHaveBeenCalled();
    expect(header(container)).toEqual(["Tag", "A", "B", "C", "D", "Z"]);
  });

  it("calls nothing for a drop in its own place", () => {
    open();
    onView.mockClear();
    const g = drag("B", 2 * 24 + 10, 2 * 24 + 14);
    fireEvent.pointerUp(g, { pointerId: 1, clientY: 2 * 24 + 14 });
    expect(onView).not.toHaveBeenCalled();
  });

  it("gives the grip no place in the tab order or the accessibility tree", () => {
    open();
    const g = grip("D");
    expect(g.getAttribute("aria-hidden")).toBe("true");
    expect(g.tabIndex).toBe(-1);
    expect(within(screen.getByRole("dialog")).queryAllByRole("button").some((b) => b.contains(g))).toBe(false);
  });
});
