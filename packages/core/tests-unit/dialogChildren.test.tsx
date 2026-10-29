/* A dialog's children are in the tree while the dialog is open and gone once
   its exit has ended: a closed dialog keeps no state of its children, and
   React's own `autoFocus` runs on a visible field. No source reads React's
   private props. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { Modal, ModalBody } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const SOURCES = import.meta.glob("../../*/src/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

const modal = (open: boolean) => (
  <Modal open={open} onClose={() => undefined}>
    <ModalBody>
      <button type="button">Inside</button>
    </ModalBody>
  </Modal>
);

describe("dialog children", () => {
  it("mount on opening and unmount once the exit has ended", () => {
    const { rerender } = render(modal(false));
    expect(screen.queryByText("Inside")).toBeNull();
    rerender(modal(true));
    expect(screen.getByText("Inside")).toBeTruthy();
    rerender(modal(false));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Inside")).toBeNull();
  });

  it("no source reads React's private props", () => {
    const readers = Object.keys(SOURCES).filter((path) => /__react(Props|Fiber)/.test(SOURCES[path] ?? ""));
    expect(readers).toEqual([]);
  });
});
