/* "Fit" is the absence of a chosen page size: offered first in a filled
   frame, never written to the view; a number picked wins and is kept. The
   layout stubs are those of fittedPage.test.tsx. */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";

interface Row {
  id: string;
}

const rows: Row[] = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}` }));

function Case({ onView, initial }: { onView?: (view: object) => void; initial?: { pageSize: number } }) {
  const t = useTable(rows, { rowKey: (r) => r.id, pageSize: 5, onViewChange: onView, initialView: initial });
  return (
    <>
      <button onClick={() => t.setPageSize("fit")}>back to fit</button>
      <t.Table aria-label="Rows">
        <t.Column value="id" label="Id" rowHeader />
        <Pagination />
      </t.Table>
    </>
  );
}

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
const selector = () => screen.getByLabelText("Rows per page") as HTMLSelectElement;
const options = () => Array.from(selector().options).map((o) => o.textContent);

afterEach(() => vi.restoreAllMocks());

describe("Fit in the page-size selector", () => {
  it("is offered first and preselected in a filled frame", () => {
    layout(20 + 12 * 20);
    render(<Case />);
    expect(options()).toEqual(["Fit", "10", "25", "50"]);
    expect(selector().value).toBe("fit");
    expect(bodyRows()).toBe(12);
  });

  it("is not offered in flow", () => {
    render(<Case />);
    expect(options()).not.toContain("Fit");
  });

  it("yields to a number picked: exactly that many rows, written to the view", () => {
    layout(20 + 12 * 20);
    const seen: object[] = [];
    render(<Case onView={(view) => seen.push(view)} />);
    fireEvent.change(selector(), { target: { value: "25" } });
    expect(bodyRows()).toBe(25);
    expect(selector().value).toBe("25");
    expect(seen.at(-1)).toMatchObject({ pageSize: 25 });
  });

  it("treats a page size in initialView as a choice", () => {
    layout(20 + 12 * 20);
    render(<Case initial={{ pageSize: 10 }} />);
    expect(bodyRows()).toBe(10);
    expect(selector().value).toBe("10");
  });

  it("takes the choice back, and writes no Fit to the view", () => {
    layout(20 + 12 * 20);
    const seen: object[] = [];
    render(<Case onView={(view) => seen.push(view)} />);
    fireEvent.change(selector(), { target: { value: "25" } });
    fireEvent.change(selector(), { target: { value: "fit" } });
    expect(bodyRows()).toBe(12);
    expect(selector().value).toBe("fit");
    expect(seen.at(-1)).not.toHaveProperty("pageSize");
    expect(JSON.stringify(seen)).not.toContain("fit");
  });

  it("goes back with setPageSize('fit')", () => {
    layout(20 + 12 * 20);
    render(<Case initial={{ pageSize: 25 }} />);
    expect(bodyRows()).toBe(25);
    fireEvent.click(screen.getByText("back to fit"));
    expect(bodyRows()).toBe(12);
  });

  it("fires no onViewChange when the frame resizes under Fit", () => {
    layout(20 + 12 * 20);
    const onView = vi.fn();
    render(<Case onView={onView} />);
    expect(onView).not.toHaveBeenCalled();
  });
});
