/* The offer to select all that match, its active form, the toolbar's count and
   what a bulk action receives in server mode. */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Toolbar, useTable } from "../src";
import type { AllMatching } from "../src";

interface Row {
  id: string;
}
const rows: Row[] = [{ id: "a" }, { id: "b" }];
let received: unknown[] = [];

function Server({ rowCount = 12400, selectable = true }: { rowCount?: number; selectable?: boolean }) {
  const { Table: Frame, Column, RowActions, Action } = useTable(rows, {
    rowKey: (r) => r.id,
    server: true,
    rowCount,
    onRequest: () => {},
  });
  return (
    <Frame selectable={selectable} aria-label="Orders">
      <Toolbar />
      <Column value="id" label="Id" rowHeader />
      <RowActions>
        <Action bulk onSelect={(selected) => received.push(Array.isArray(selected) ? selected.map((r) => r.id) : selected)}>
          Release
        </Action>
      </RowActions>
    </Frame>
  );
}

const tick = (name: string) => fireEvent.click(screen.getByRole("checkbox", { name }));
const offer = () => document.querySelector("[data-select-matching]");

beforeEach(() => {
  received = [];
});

describe("the offer to select all that match", () => {
  it("appears for a ticked page with more rows behind it, and is said and tabbable", () => {
    render(<Server />);
    expect(offer()).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all on this page" }));
    const line = offer()!;
    expect(line.getAttribute("role")).toBe("status");
    expect(line.textContent).toContain("All 2 on this page are selected.");
    expect(screen.getByRole("button", { name: "Select all 12,400 that match" }).getAttribute("tabindex")).not.toBe("-1");
  });

  it("is absent when the page is the whole set, when a row is unticked, and without a selection column", () => {
    const { unmount } = render(<Server rowCount={2} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all on this page" }));
    expect(offer()).toBeNull();
    unmount();
    const second = render(<Server />);
    tick("Select a");
    expect(offer()).toBeNull();
    second.unmount();
    render(<Server selectable={false} />);
    expect(offer()).toBeNull();
  });

  it("selects all, counts rowCount minus the exceptions, and hands the action the request and the exceptions", () => {
    render(<Server />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all on this page" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all 12,400 that match" }));
    expect(offer()!.textContent).toContain("All 12,400 that match are selected.");
    expect(screen.getByText("12,400 selected")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select all on this page" }).getAttribute("aria-checked")).not.toBe("mixed");

    tick("Select a");
    expect(screen.getByText("12,399 selected")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    const [all] = received as [AllMatching];
    expect(all.except).toEqual(["a"]);
    expect(all.request).toMatchObject({ search: "", page: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(offer()).toBeNull();
    expect(screen.queryByText(/selected$/)).toBeNull();
  });

  it("hands over rows while the state is off", () => {
    render(<Server />);
    tick("Select a");
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    expect(received).toEqual([["a"]]);
  });
});
