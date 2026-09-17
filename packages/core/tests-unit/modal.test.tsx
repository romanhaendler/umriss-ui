/* The modal closes once (library-audit 01).

   Before, every gesture reported `onClose` twice: once from the gesture
   itself and once more when the choreography called `dialog.close()` at the
   end and the native close event fell into the same listener. Whoever counts
   the closings, logs them or shows a message saw two.

   Escape is not a cancel in jsdom - the stand-in in setup.ts deliberately
   does not reproduce the platform's promises. The `cancel` event the browser
   sends in its place is therefore triggered directly. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal, ModalBody, ModalHeader } from "../src/components/Modal";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function Fixture({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <ModalHeader title="Title" />
      <ModalBody>Content</ModalBody>
    </Modal>
  );
}

const dialog = () => document.querySelector("dialog")!;
/* Far beyond any exit: what is checked is the number of reports, not the
   duration. */
const afterExit = () => act(() => vi.advanceTimersByTime(1000));

describe("Modal – onClose exactly once", () => {
  it("on the cross", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    afterExit();
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("on Escape", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    afterExit();
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("on a click on the backdrop", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    fireEvent.mouseDown(dialog());
    afterExit();
    expect(dialog().hasAttribute("open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /* The case the listener on the element is there for in the first place: the
     browser closes the dialog itself (a form with method="dialog", a second
     Escape without user activation). That has to keep arriving. */
  /* Review finding: a second Escape without user activation sends `cancel` as
     non-cancelable and closes the dialog anyway. Then the cancelling reported
     and right after it the close event did too. In the browser both lie in the
     same task, before any effect - hence in one act. */
  it("reports an Escape the browser does not let be cancelled only once", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    act(() => {
      dialog().dispatchEvent(new Event("cancel", { cancelable: false }));
      dialog().close();
    });
    afterExit();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports a close that does not come from the choreography", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    act(() => dialog().close());
    afterExit();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
