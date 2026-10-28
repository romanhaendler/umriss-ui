/* The modal closes once (library-audit 01).

   Before, every gesture reported `onClose` twice: once from the gesture
   itself and once more when the choreography called `dialog.close()` at the
   end and the native close event fell into the same listener. Whoever counts
   the closings, logs them or shows a message saw two.

   Escape is not a cancel in jsdom - the stand-in in setup.ts deliberately
   does not reproduce the platform's promises. The `cancel` event the browser
   sends in its place is therefore triggered directly. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createRef, useState } from "react";
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

/* A <dialog> takes no name from its content. The header's heading names the
   window only through the reference - without it a screen reader said
   "dialog" and nothing more, whatever the header promised. */
describe("Modal – named by its header", () => {
  it("carries the title as its accessible name", () => {
    render(<Fixture onClose={vi.fn()} />);
    const title = document.getElementById(dialog().getAttribute("aria-labelledby") ?? "");
    expect(title?.textContent).toBe("Title");
  });

  it("gives way to a name of the caller's", () => {
    render(
      <Modal open onClose={vi.fn()} aria-labelledby="own">
        <ModalHeader title="Title" />
      </Modal>,
    );
    expect(dialog().getAttribute("aria-labelledby")).toBe("own");
  });

  it("takes a ref to a <dialog> and no other element's", () => {
    const dialogRef = createRef<HTMLDialogElement>();
    const divRef = createRef<HTMLDivElement>();
    const ok = <Modal open onClose={() => {}} ref={dialogRef} />;
    // @ts-expect-error - a Modal renders a <dialog>, not a <div>.
    const wrong = <Modal open onClose={() => {}} ref={divRef} />;
    expect([ok, wrong]).toHaveLength(2);
  });
});

describe("a Modal without onClose", () => {
  it("throws nothing on Escape and the cross, and warns once naming onClose", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error a JavaScript host leaves `onClose` out
    render(<Modal open><ModalHeader title="Title" /></Modal>);
    expect(() => {
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      fireEvent(dialog(), new Event("cancel", { cancelable: true }));
      act(() => vi.advanceTimersByTime(1000));
    }).not.toThrow();
    const named = warn.mock.calls.filter((c) => String(c[0]).includes("onClose"));
    expect(named).toHaveLength(1);
    warn.mockRestore();
  });
});

describe("autoFocus inside a Modal", () => {
  it("keeps the focus the dialog's own focusing steps would take away", () => {
    // The platform's showModal() puts the focus on the first tab stop.
    const show = vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
      this.querySelector("button")!.focus();
    });
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader title="Title" />
        <ModalBody><input aria-label="Second" autoFocus /></ModalBody>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Second"));
    show.mockRestore();
  });
});
