/* The outer panel keeps its place in the Escape order when it re-renders
   while a nested list is open. */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, useRef, useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Popover, Select } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/* The same element every render: only the outer popover's own props change. */
const month = (
  <Select aria-label="Month">
    <option value="1">January</option>
    <option value="2">February</option>
  </Select>
);

function Outer() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);
  const [count, setCount] = useState(0);
  return (
    <>
      <button ref={anchorRef}>Trigger</button>
      <Popover open={open} onOpenChange={(next) => setOpen(next)} anchorRef={anchorRef} role="dialog" aria-label="Outer">
        <button onClick={() => setCount(count + 1)}>Rerender {count}</button>
        {month}
      </Popover>
    </>
  );
}

it("closes only the list on Escape after the outer panel re-rendered", () => {
  render(<Outer />);
  const panel = () => screen.queryByRole("dialog", { name: "Outer" });
  const press = (element: Element) => {
    fireEvent.pointerDown(element, { pointerType: "mouse", button: 0 });
    fireEvent.mouseDown(element, { button: 0 });
  };
  press(within(panel()!).getByRole("combobox"));
  expect(screen.queryByRole("listbox")).not.toBeNull();
  fireEvent.click(within(panel()!).getByRole("button", { name: /Rerender/ }));
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(panel()).not.toBeNull();
});
