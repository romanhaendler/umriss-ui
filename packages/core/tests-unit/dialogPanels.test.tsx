/* A press inside a panel that portals into the dialog (Popover, Menu,
   DatePicker) is not a press on the backdrop: the dialog stays open. Only
   the dialog element itself and its two spacers are backdrop. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useRef, useState, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, Drawer, Menu, MenuItem, Modal, ModalBody, Popover } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function Anchored() {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref}>anchor</button>
      <Popover open onOpenChange={() => undefined} anchorRef={ref}>
        <span>popover text</span>
      </Popover>
    </>
  );
}

const contents: Record<string, { node: ReactNode; open?: string; target: string }> = {
  Popover: { node: <Anchored />, target: "popover text" },
  Menu: {
    node: (
      <Menu trigger={<button>menu</button>}>
        <MenuItem>item</MenuItem>
      </Menu>
    ),
    open: "menu",
    target: "item",
  },
  DatePicker: {
    node: <DatePicker value={new Date(2026, 0, 15)} onChange={() => undefined} />,
    open: "15/01/2026",
    target: "20",
  },
};

const dialog = () => document.querySelector("dialog")!;
const afterExit = () => act(() => vi.advanceTimersByTime(1000));

describe.each([
  ["Modal", Modal],
  ["Drawer", Drawer],
])("%s", (_name, Dialog) => {
  function Fixture({
    onClose,
    closeOnBackdrop,
    children,
  }: {
    onClose: () => void;
    closeOnBackdrop?: boolean;
    children: ReactNode;
  }) {
    const [open, setOpen] = useState(true);
    return (
      <Dialog
        open={open}
        closeOnBackdrop={closeOnBackdrop}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <ModalBody>{children}</ModalBody>
      </Dialog>
    );
  }

  it.each(Object.keys(contents))("stays open on a press inside a %s panel", (key) => {
    const { node, open, target } = contents[key]!;
    const onClose = vi.fn();
    render(<Fixture onClose={onClose}>{node}</Fixture>);
    if (open) fireEvent.click(screen.getByText(open));
    const panelTarget = screen.getByText(target);
    expect(dialog().contains(panelTarget)).toBe(true);
    fireEvent.mouseDown(panelTarget);
    afterExit();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not close on the dialog with closeOnBackdrop off", () => {
    const onClose = vi.fn();
    render(
      <Fixture onClose={onClose} closeOnBackdrop={false}>
        x
      </Fixture>,
    );
    fireEvent.mouseDown(dialog());
    afterExit();
    expect(onClose).not.toHaveBeenCalled();
  });
});

it("closes on a press on a spacer", () => {
  const onClose = vi.fn();
  render(
    <Modal open onClose={onClose}>
      <ModalBody>x</ModalBody>
    </Modal>,
  );
  fireEvent.mouseDown(dialog().firstElementChild!);
  expect(onClose).toHaveBeenCalledTimes(1);
});
