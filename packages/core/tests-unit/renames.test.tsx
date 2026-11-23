/* The old names of the renamed props and values still work, warn once in
   development and lose to the new one where both are given. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPalette, Menu, MenuItem, Meter, ProgressBar } from "../src";
import type { Align, Direction, Key, LimitSide, PopoverAlign, Side, TreeDirection, TreeKey } from "../src";

afterEach(() => vi.restoreAllMocks());

const warnings = () => vi.spyOn(console, "warn").mockImplementation(() => undefined);
const told = (warn: ReturnType<typeof warnings>, what: string) => warn.mock.calls.filter(([message]) => String(message).includes(what)).length;

describe("showValue", () => {
  it("Meter: new works, old works and warns once, new wins", () => {
    const warn = warnings();
    const { rerender } = render(<Meter value={0.5} label="Load" showValue={false} />);
    expect(screen.queryByText("50%")).toBeNull();
    rerender(<Meter value={0.5} label="Load" showLabel={false} />);
    rerender(<Meter value={0.5} label="Load" showLabel={false} />);
    expect(screen.queryByText("50%")).toBeNull();
    expect(told(warn, "Meter showLabel")).toBe(1);
    rerender(<Meter value={0.5} label="Load" showValue showLabel={false} />);
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("ProgressBar: new works, old works and warns once, new wins", () => {
    const warn = warnings();
    const { rerender } = render(<ProgressBar value={0.5} label="Upload" showValue />);
    expect(screen.getByText("50%")).toBeTruthy();
    rerender(<ProgressBar value={0.5} label="Upload" showLabel />);
    rerender(<ProgressBar value={0.5} label="Upload" showLabel />);
    expect(screen.getByText("50%")).toBeTruthy();
    expect(told(warn, "ProgressBar showLabel")).toBe(1);
    rerender(<ProgressBar value={0.5} label="Upload" showValue={false} showLabel />);
    expect(screen.queryByText("50%")).toBeNull();
  });
});

describe("CommandPalette onSelect", () => {
  const items = [{ id: "a", label: "Alpha" }];
  const choose = () => fireEvent.mouseDown(screen.getByRole("option", { name: /Alpha/ }));
  const palette = (handlers: { onSelect?: (id: string) => void; onChoose?: (id: string) => void }) => (
    <CommandPalette open onClose={() => undefined} items={items} restingItems={items} {...handlers} />
  );

  it("new works, old works and warns once, new wins", () => {
    const warn = warnings();
    const fresh = vi.fn();
    const old = vi.fn();
    const { rerender } = render(palette({ onSelect: fresh }));
    choose();
    expect(fresh).toHaveBeenCalledWith("a");
    rerender(palette({ onChoose: old }));
    rerender(palette({ onChoose: old }));
    choose();
    expect(old).toHaveBeenCalledWith("a");
    expect(told(warn, "CommandPalette onChoose")).toBe(1);
    old.mockClear();
    fresh.mockClear();
    rerender(palette({ onSelect: fresh, onChoose: old }));
    choose();
    expect(fresh).toHaveBeenCalledTimes(1);
    expect(old).not.toHaveBeenCalled();
  });
});

describe("MenuItem tone", () => {
  it('"neutral" is quiet; "default" still works and warns once', () => {
    const warn = warnings();
    render(
      <Menu trigger={<button type="button">Open</button>}>
        <MenuItem tone="neutral">One</MenuItem>
        <MenuItem tone="default">Two</MenuItem>
        <MenuItem tone="default">Three</MenuItem>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(told(warn, "MenuItem tone")).toBe(1);
  });
});

describe("the renamed types", () => {
  it("the old names are the new ones", () => {
    const key: Key = "a" satisfies TreeKey;
    const direction: Direction = "up" satisfies TreeDirection;
    const side: Side = "upper" satisfies LimitSide;
    const align: Align = "end" satisfies PopoverAlign;
    expect([key, direction, side, align]).toHaveLength(4);
  });
});
