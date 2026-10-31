/* WebKit does not focus a button a mouse pressed. The dialog gives the focus
   back to that button all the same - also the first time anything opens it, so
   the press must have been noticed before the dialog was ever shown. */

import { act, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal, ModalBody, ModalHeader } from "../src/components/Modal";

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
