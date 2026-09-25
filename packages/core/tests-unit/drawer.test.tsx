/* The drawer at the seam a caller has (core-foundations 03): a Modal that
   enters from an edge. The focus trap, Escape and the return of the focus are
   the native dialog's and are checked in the browser
   (features-basics.spec.ts); what is tested here is that the drawer IS that
   dialog, named by its head, closing once per gesture, standing at the side
   it was given. Escape arrives as the `cancel` event the browser sends for it; jsdom
   does not send it, as modal.test.tsx explains. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Drawer, ModalBody, ModalHeader } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function Fixture({ onClose = () => undefined, side }: { onClose?: () => void; side?: "left" | "right" }) {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      open={open}
      side={side}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <ModalHeader title="Pump P-101" />
      <ModalBody>
        <button type="button">Acknowledge</button>
      </ModalBody>
    </Drawer>
  );
}

const dialog = () => document.querySelector("dialog")!;
const afterExit = () => act(() => vi.advanceTimersByTime(1000));

describe("Drawer", () => {
  it("is a modal dialog named by its head", () => {
    render(<Fixture />);
    expect(dialog().hasAttribute("open")).toBe(true);
    expect(screen.getByRole("dialog", { name: "Pump P-101" })).toBe(dialog());
  });

  it("stands at the right by default, at the left on request", () => {
    const { unmount } = render(<Fixture />);
    expect(dialog().getAttribute("data-side")).toBe("right");
    unmount();
    render(<Fixture side="left" />);
    expect(dialog().getAttribute("data-side")).toBe("left");
  });

  it("closes once on Escape, on the cross and on the backdrop", () => {
    for (const gesture of [
      () => fireEvent(dialog(), new Event("cancel", { cancelable: true })),
      () => fireEvent.click(screen.getByRole("button", { name: "Close" })),
      () => fireEvent.mouseDown(dialog()),
    ]) {
      const onClose = vi.fn();
      const { unmount } = render(<Fixture onClose={onClose} />);
      gesture();
      afterExit();
      expect(dialog().hasAttribute("open")).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it("does not close on a press inside its sheet", () => {
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    fireEvent.mouseDown(screen.getByRole("button", { name: "Acknowledge" }));
    afterExit();
    expect(onClose).not.toHaveBeenCalled();
  });
});
