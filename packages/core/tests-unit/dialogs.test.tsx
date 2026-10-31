/* Dialogs hold together: a nested one closes alone, a hidden one gives the
   page back, focus returns to the opener, a confirmation fires once. */

import { Activity, act, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPalette } from "../src/components/CommandPalette";
import { ConfirmDialog, Modal, ModalBody, ModalHeader } from "../src/components/Modal";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
const afterExit = () => act(() => vi.advanceTimersByTime(1000));
const dialogs = () => [...document.querySelectorAll("dialog")] as [HTMLDialogElement, HTMLDialogElement];

function Nested({ outer, inner, onConfirm }: { outer: () => void; inner: () => void; onConfirm?: () => void }) {
  const [o, setO] = useState(true);
  const [i, setI] = useState(true);
  return (
    <Modal open={o} onClose={() => (outer(), setO(false))}>
      <ModalHeader title="Edit" />
      <ModalBody>
        <ConfirmDialog
          open={i}
          onClose={() => (inner(), setI(false))}
          onConfirm={() => (onConfirm?.(), setI(false))}
          title="Delete?"
        />
      </ModalBody>
    </Modal>
  );
}

describe("a dialog inside a dialog", () => {
  for (const [name, fire] of [
    ["Escape", (d: HTMLElement) => fireEvent(d, new Event("cancel", { cancelable: true }))],
    ["a native close", (d: HTMLElement) => act(() => (d as HTMLDialogElement).close())],
    ["the backdrop", (d: HTMLElement) => fireEvent.mouseDown(d)],
  ] as const) {
    it(`closes only itself on ${name}`, () => {
      const outer = vi.fn();
      const inner = vi.fn();
      render(<Nested outer={outer} inner={inner} />);
      fire(dialogs()[1]);
      afterExit();
      expect(inner).toHaveBeenCalledTimes(1);
      expect(outer).not.toHaveBeenCalled();
      expect(dialogs()[0].hasAttribute("open")).toBe(true);
    });
  }

  it("closes only itself on Cancel and on Confirm", () => {
    const outer = vi.fn();
    const onConfirm = vi.fn();
    render(<Nested outer={outer} inner={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    afterExit();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe("a hidden dialog", () => {
  it("is closed while hidden and open again when shown", () => {
    const { rerender } = render(
      <Activity mode="visible">
        <Modal open onClose={() => {}}>
          <ModalHeader title="T" />
        </Modal>
      </Activity>,
    );
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(true);
    rerender(
      <Activity mode="hidden">
        <Modal open onClose={() => {}}>
          <ModalHeader title="T" />
        </Modal>
      </Activity>,
    );
    expect(dialog.open).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    rerender(
      <Activity mode="visible">
        <Modal open onClose={() => {}}>
          <ModalHeader title="T" />
        </Modal>
      </Activity>,
    );
    expect(dialog.open).toBe(true);
  });
});

describe("the focus", () => {
  it("returns to the opener when the open Modal unmounts", () => {
    function Host() {
      const [o, setO] = useState(false);
      return (
        <>
          <button onClick={() => setO(true)}>open</button>
          {o && (
            <Modal open onClose={() => setO(false)}>
              <ModalHeader title="T" />
            </Modal>
          )}
        </>
      );
    }
    render(<Host />);
    const opener = screen.getByRole("button", { name: "open" });
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).not.toBe(opener);
    fireEvent(dialogs()[0], new Event("cancel", { cancelable: true }));
    expect(document.activeElement).toBe(opener);
  });

  it("goes to the first field, not to Close", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader title="T" />
        <ModalBody>
          <input aria-label="First" />
        </ModalBody>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByLabelText("First"));
  });

  it("goes to the dialog itself when there is no field", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader title="T" />
        <ModalBody>Text</ModalBody>
      </Modal>,
    );
    expect(document.activeElement).toBe(dialogs()[0]);
  });

  it("stays in a ConfirmDialog whose Confirm turns busy", () => {
    const { rerender } = render(<ConfirmDialog open onClose={() => {}} onConfirm={() => {}} title="T" />);
    const confirm = screen.getByRole("button", { name: "Confirm" });
    confirm.focus();
    rerender(<ConfirmDialog open loading onClose={() => {}} onConfirm={() => {}} title="T" />);
    expect(dialogs()[0].contains(document.activeElement)).toBe(true);
  });
});

describe("a ConfirmDialog", () => {
  it("confirms once per opening", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="T" />);
    const confirm = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("confirms again in a second opening", () => {
    const onConfirm = vi.fn();
    const { rerender } = render(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="T" />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    rerender(<ConfirmDialog open={false} onClose={() => {}} onConfirm={onConfirm} title="T" />);
    afterExit();
    rerender(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="T" />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("locks Escape and the backdrop while loading", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open loading onClose={onClose} onConfirm={() => {}} title="T" />);
    fireEvent(dialogs()[0], new Event("cancel", { cancelable: true }));
    fireEvent.mouseDown(dialogs()[0]);
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("a Modal", () => {
  it("locks the page's scroll while open and frees it after", () => {
    const { rerender } = render(<Modal open onClose={() => {}} />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(<Modal open={false} onClose={() => {}} />);
    afterExit();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes on a synthetic Escape keydown", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} />);
    fireEvent.keyDown(dialogs()[0], { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the children of a ModalHeader as its heading", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader>Heading</ModalHeader>
      </Modal>,
    );
    expect(screen.getByRole("heading", { name: "Heading" })).toBeTruthy();
  });
});

describe("a closed CommandPalette", () => {
  it("mounts nothing", () => {
    render(<CommandPalette open={false} onClose={() => {}} items={[]} onChoose={() => {}} />);
    expect(document.querySelector("dialog")!.children).toHaveLength(0);
    expect(document.querySelector("input")).toBeNull();
  });
});
