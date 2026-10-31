/* WebKit does not focus a button a mouse pressed. The dialog gives the focus
   back to that button all the same - also the first time anything opens it, so
   the press must have been noticed before the dialog was ever shown. */

import { act, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Drawer, Modal, ModalBody, ModalHeader } from "../src/components/Modal";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      {open && (
        <Modal open onClose={() => setOpen(false)}>
          <ModalHeader title="T" />
          <ModalBody>
            <p>text</p>
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

describe("a dialog opened for the first time from a pressed, unfocused button", () => {
  it("gives the focus back to the button", () => {
    render(<App />);
    const opener = screen.getByRole("button", { name: "open" });
    // the press focuses nothing, as in WebKit
    fireEvent.pointerDown(opener);
    fireEvent.click(opener);
    expect(document.querySelector("dialog")?.open).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    act(() => vi.advanceTimersByTime(1000));
    expect(document.activeElement).toBe(opener);
  });
});

function InDrawer() {
  const [inner, setInner] = useState(false);
  return (
    <Drawer open onClose={() => {}}>
      <ModalHeader title="D" />
      <button onClick={() => setInner(true)}>open inner</button>
      <Modal open={inner} onClose={() => setInner(false)}>
        <ModalHeader title="I" />
        <ModalBody>
          <p>text</p>
        </ModalBody>
      </Modal>
    </Drawer>
  );
}

describe("a dialog opened from a pressed button inside another dialog", () => {
  it("gives the focus back to the button, not to the outer dialog", () => {
    render(<InDrawer />);
    act(() => vi.advanceTimersByTime(50));
    const opener = screen.getByRole("button", { name: "open inner" });
    // the outer dialog holds the focus; the press focuses nothing
    (document.querySelector("dialog") as HTMLElement).focus();
    fireEvent.pointerDown(opener);
    fireEvent.click(opener);
    const inner = document.querySelectorAll("dialog")[1]!;
    fireEvent.click(inner.querySelector("[data-dialog-close]")!);
    act(() => vi.advanceTimersByTime(1000));
    expect(document.activeElement).toBe(opener);
  });

  it("also where the close hands the focus to the outer dialog", () => {
    render(<InDrawer />);
    act(() => vi.advanceTimersByTime(50));
    const opener = screen.getByRole("button", { name: "open inner" });
    const outer = document.querySelector("dialog") as HTMLDialogElement;
    outer.focus();
    fireEvent.pointerDown(opener);
    fireEvent.click(opener);
    const inner = document.querySelectorAll("dialog")[1]!;
    // WebKit: closing the inner dialog leaves the focus on the outer one
    const close = inner.close.bind(inner);
    inner.close = () => {
      close();
      outer.focus();
    };
    fireEvent.click(inner.querySelector("[data-dialog-close]")!);
    act(() => vi.advanceTimersByTime(1000));
    expect(document.activeElement).toBe(opener);
  });
});
