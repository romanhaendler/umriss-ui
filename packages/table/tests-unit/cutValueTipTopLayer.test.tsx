/* The tip of a cut value in a dialog stands in the top layer, as core's
   tooltip does. jsdom has no Popover API: the test supplies it. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

function Shipments() {
  const { Table, Column } = useTable([{ id: "FP-1", note: "A note much longer than its cell" }], { rowKey: (s) => s.id });
  return (
    <Table aria-label="Shipments">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="note" label="Note" />
    </Table>
  );
}

/* The note is cut; the tip is placed (top and left set, visible) only once measured. */
function noteIsCut() {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.textContent?.startsWith("A note") ? 180 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.textContent?.startsWith("A note") ? 40 : 100;
  });
}

function open(inDialog: boolean) {
  vi.useFakeTimers();
  noteIsCut();
  const host = document.createElement(inDialog ? "dialog" : "div");
  if (host instanceof HTMLDialogElement) host.open = true;
  document.body.append(host);
  render(<Shipments />, { container: host.appendChild(document.createElement("div")) });
  fireEvent.pointerOver(screen.getByText("A note much longer than its cell"));
  act(() => vi.advanceTimersByTime(400));
  return screen.getByRole("tooltip");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete (HTMLElement.prototype as { showPopover?: unknown }).showPopover;
});

describe("the tip of a cut value and the top layer", () => {
  it("is a manual popover shown before it is measured, in a dialog", () => {
    const shown: string[] = [];
    (HTMLElement.prototype as { showPopover?: () => void }).showPopover = function (this: HTMLElement) {
      shown.push(this.style.visibility);
    };
    const tip = open(true);
    expect(tip.getAttribute("popover")).toBe("manual");
    expect(shown).toEqual(["hidden"]);
    expect(tip.style.visibility).toBe("");
  });

  it("carries no popover attribute without the API", () => {
    expect(open(true).hasAttribute("popover")).toBe(false);
  });

  it("carries no popover attribute outside a dialog", () => {
    (HTMLElement.prototype as { showPopover?: () => void }).showPopover = () => {};
    expect(open(false).hasAttribute("popover")).toBe(false);
  });
});
