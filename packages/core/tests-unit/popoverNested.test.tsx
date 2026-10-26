/* A surface opened from inside a popover's panel belongs to that panel: a
   press in it is not an outside press, and Escape closes the innermost one. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useRef, useState, type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Modal, ModalBody, Popover, Select } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const press = (element: Element) => {
  fireEvent.pointerDown(element, { pointerType: "mouse", button: 0 });
  fireEvent.mouseDown(element, { button: 0 });
};
const settle = () => act(() => vi.advanceTimersByTime(1000));

function Nested({ onChange }: { onChange: (value: string) => void }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);
  return (
    <>
      <button ref={anchorRef}>Trigger</button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchorRef} role="dialog" aria-label="Outer">
        <Select aria-label="Month" defaultValue="1" onChange={(event) => onChange(event.target.value)}>
          <option value="1">January</option>
          <option value="2">February</option>
        </Select>
      </Popover>
    </>
  );
}

const outer = () => screen.queryByRole("dialog", { name: "Outer" });

const hosts: Record<"a popover" | "a modal", (inner: ReactNode) => ReactNode> = {
  "a popover": (inner) => inner,
  "a modal": (inner) => (
    <Modal open onClose={() => undefined} title="Host">
      <ModalBody>{inner}</ModalBody>
    </Modal>
  ),
};

describe.each(["a popover", "a modal"] as const)("a Select in %s", (name) => {
  it("picks in its own list and the panel stays open", () => {
    const onChange = vi.fn();
    render(hosts[name](<Nested onChange={onChange} />));
    press(within(outer()!).getByRole("combobox"));
    const option = within(screen.getByRole("listbox")).getByRole("option", { name: "February" });
    press(option);
    fireEvent.click(option);
    settle();
    expect(onChange).toHaveBeenCalledWith("2");
    expect(outer()).not.toBeNull();
  });

  it("closes the list on the first Escape and the panel on the second, focus back on the trigger", () => {
    render(hosts[name](<Nested onChange={() => undefined} />));
    press(within(outer()!).getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    settle();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(outer()).not.toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    settle();
    expect(outer()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Trigger" }));
  });
});
