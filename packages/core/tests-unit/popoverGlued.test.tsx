/* Where a Popover's box is laid out: absolute in the body (the page scrolls it
   along), fixed in a dialog. jsdom has no layout, so the rectangles are set by hand. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { Popover } from "../src/components/Popover/Popover";

function Setup({ inDialog = false }: { inDialog?: boolean }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const trigger = <button ref={anchorRef}>Trigger</button>;
  return (
    <>
      {inDialog ? <dialog open>{trigger}</dialog> : trigger}
      <Popover open onOpenChange={() => {}} anchorRef={anchorRef} aria-label="Surface">
        <p>Content</p>
      </Popover>
    </>
  );
}

const rect = (top: number, height: number) =>
  ({ top, bottom: top + height, left: 10, right: 110, width: 100, height, x: 10, y: top, toJSON: () => ({}) }) as DOMRect;

afterEach(() => vi.restoreAllMocks());

describe("Popover – the box it is laid out in", () => {
  it("is absolute in the body, offset by the body's origin so the page scrolls it along", () => {
    // The probe (a span) stands 150px above the window: the page is scrolled by 150.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return this.localName === "span" ? rect(-150, 0) : this.localName === "button" ? rect(100, 32) : rect(0, 40);
    });
    render(<Setup />);
    const panel = screen.getByRole("dialog", { name: "Surface" });
    expect(panel.style.position).toBe("absolute");
    expect(panel.style.top).toBe(`${100 + 32 + 6 + 150}px`);
  });

  it("stays fixed in a dialog", () => {
    render(<Setup inDialog />);
    expect(screen.getByRole("dialog", { name: "Surface" }).style.position).not.toBe("absolute");
  });
});
