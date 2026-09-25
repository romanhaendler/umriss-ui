/* The splitter at the seam a caller has (core-layout-extras 01): the APG
   window splitter - a focusable `role="separator"` whose value is the first
   pane's share in per cent, arrows that move it, Enter that collapses the
   first pane and brings it back. What jsdom cannot give is a width, so the
   drag is measured against a box handed in through `getBoundingClientRect`. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { LanguageProvider, Splitter } from "../src";
import { GERMAN_WORDING } from "../src/lib/language/de";

const separator = () => screen.getByRole("separator");
const press = (key: string) => fireEvent.keyDown(separator(), { key });
const now = () => separator().getAttribute("aria-valuenow");

function Panes(props: Partial<Parameters<typeof Splitter>[0]>) {
  return (
    <Splitter {...props}>
      <div>Trend</div>
      <div>Alarms</div>
    </Splitter>
  );
}

describe("Splitter", () => {
  it("is a focusable separator for the first pane, its share in per cent", () => {
    render(<Panes aria-label="Trend and alarms" separatorLabel="Trend" defaultValue={40} />);
    const handle = screen.getByRole("separator", { name: "Trend" });
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute("aria-valuenow")).toBe("40");
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    const first = document.getElementById(handle.getAttribute("aria-controls")!);
    expect(first?.textContent).toBe("Trend");
  });

  it("stands between panes side by side as a vertical line, and between stacked panes as a horizontal one", () => {
    const { rerender } = render(<Panes />);
    expect(separator().getAttribute("aria-orientation")).toBe("vertical");
    rerender(<Panes orientation="vertical" />);
    expect(separator().getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("is named from the wording where the caller names nothing", () => {
    const { unmount } = render(<Panes />);
    expect(screen.getByRole("separator", { name: "Resize the panes" })).toBeTruthy();
    unmount();
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Panes />
      </LanguageProvider>,
    );
    expect(screen.getByRole("separator", { name: "Größe der Bereiche ändern" })).toBeTruthy();
  });

  it("moves by a step on the arrows of its axis, and to the bounds on Home and End", () => {
    render(<Panes defaultValue={50} step={5} min={20} max={80} />);
    press("ArrowRight");
    expect(now()).toBe("55");
    press("ArrowLeft");
    press("ArrowLeft");
    expect(now()).toBe("45");
    // Up and down belong to stacked panes, not to these.
    press("ArrowDown");
    expect(now()).toBe("45");
    press("End");
    expect(now()).toBe("80");
    press("ArrowRight");
    expect(now()).toBe("80");
    press("Home");
    expect(now()).toBe("20");
  });

  it("moves stacked panes on up and down", () => {
    render(<Panes orientation="vertical" defaultValue={50} step={10} />);
    press("ArrowDown");
    expect(now()).toBe("60");
    press("ArrowUp");
    press("ArrowUp");
    expect(now()).toBe("40");
    press("ArrowRight");
    expect(now()).toBe("40");
  });

  it("collapses the first pane on Enter and restores it on the next", () => {
    const changed = vi.fn();
    render(<Panes defaultValue={35} min={10} onChange={changed} />);
    press("Enter");
    expect(now()).toBe("10");
    press("Enter");
    expect(now()).toBe("35");
    expect(changed.mock.calls.map((c) => c[0])).toEqual([10, 35]);
  });

  it("controlled: reports, and follows once the value does", () => {
    const reported = vi.fn();
    function Controlled() {
      const [share, setShare] = useState(30);
      return (
        <>
          <Splitter value={share} onChange={(v) => { reported(v); setShare(v); }} step={10}>
            <div>A</div>
            <div>B</div>
          </Splitter>
          <output>{share}</output>
        </>
      );
    }
    render(<Controlled />);
    press("ArrowRight");
    expect(reported).toHaveBeenLastCalledWith(40);
    expect(screen.getByRole("status").textContent).toBe("40");
    expect(now()).toBe("40");
  });

  it("stays where the caller holds it when the caller does not follow", () => {
    render(<Panes value={30} onChange={() => undefined} />);
    press("ArrowRight");
    expect(now()).toBe("30");
  });

  /* The line keeps the point it was grabbed at, and the panes share the box
     less the separator's strip: box 100-500, the strip 8 wide. */
  it("follows the pointer from where it was grabbed, inside its bounds", () => {
    const { container } = render(<Panes defaultValue={50} min={10} max={90} />);
    const root = container.firstElementChild as HTMLElement;
    const rect = (left: number, width: number) => () =>
      ({ left, top: 0, width, height: 300, right: left + width, bottom: 300, x: left, y: 0, toJSON: () => ({}) });
    root.getBoundingClientRect = rect(100, 400);
    separator().getBoundingClientRect = rect(298, 8);
    // Grabbed six pixels left of the line's middle (302): at 200 the middle
    // stands at 206, and (206 - 100 - 4) / (400 - 8) is 26 per cent.
    fireEvent.pointerDown(separator(), { pointerId: 1, button: 0, clientX: 296, clientY: 10 });
    fireEvent.pointerMove(separator(), { pointerId: 1, clientX: 200, clientY: 10 });
    expect(now()).toBe("26");
    fireEvent.pointerMove(separator(), { pointerId: 1, clientX: 60, clientY: 10 });
    expect(now()).toBe("10");
    fireEvent.pointerUp(separator(), { pointerId: 1, clientX: 60, clientY: 10 });
    // Released: a move no longer drags.
    fireEvent.pointerMove(separator(), { pointerId: 1, clientX: 400, clientY: 10 });
    expect(now()).toBe("10");
  });

  it("lets a caller's key handler run first and keep the key", () => {
    render(<Panes defaultValue={50} onKeyDown={(event) => event.key === "Enter" && event.preventDefault()} />);
    press("Enter");
    expect(now()).toBe("50");
    press("ArrowRight");
    expect(now()).toBe("55");
  });

  it("takes a pane folded to nothing out of the tab order", () => {
    render(<Panes defaultValue={30} />);
    const first = document.getElementById(separator().getAttribute("aria-controls")!)!;
    expect(first.hasAttribute("inert")).toBe(false);
    press("Enter");
    expect(first.hasAttribute("inert")).toBe(true);
    press("End");
    expect(first.hasAttribute("inert")).toBe(false);
    expect(separator().nextElementSibling?.hasAttribute("inert")).toBe(true);
  });
});
