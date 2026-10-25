/* The top layer's rule stands twice, on purpose: core's tooltip decides in
   `lib/portalTarget.ts`, which core does not export, and the table's tip for a
   cut value repeats the step (ADR-0063). Nothing held the two together, so this
   runs both through the same four cases and compares: a manual popover inside
   a dialog where the Popover API exists, and nothing else anywhere.

   The direction is that of limitConformance.test.ts: this package reads
   core's, core reads nothing from here. */

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "@umriss-ui/core";
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

function hostIn(dialog: boolean) {
  const host = document.createElement(dialog ? "dialog" : "div");
  if (host instanceof HTMLDialogElement) host.open = true;
  document.body.append(host);
  return host.appendChild(document.createElement("div"));
}

/* The popover attribute core's tooltip gets. */
function coreTip(dialog: boolean) {
  render(
    <Tooltip content="Core's tip">
      <button type="button">Trigger</button>
    </Tooltip>,
    { container: hostIn(dialog) },
  );
  fireEvent.pointerEnter(screen.getByRole("button", { name: "Trigger" }));
  act(() => vi.advanceTimersByTime(400));
  return screen.getByRole("tooltip").getAttribute("popover");
}

/* The popover attribute the table's tip gets. */
function tableTip(dialog: boolean) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.textContent?.startsWith("A note") ? 180 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.textContent?.startsWith("A note") ? 40 : 100;
  });
  render(<Shipments />, { container: hostIn(dialog) });
  fireEvent.pointerOver(screen.getByText("A note much longer than its cell"));
  act(() => vi.advanceTimersByTime(400));
  return screen.getByRole("tooltip").getAttribute("popover");
}

function clearTheBody() {
  cleanup();
  document.body.replaceChildren();
}

afterEach(() => {
  clearTheBody();
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete (HTMLElement.prototype as { showPopover?: unknown }).showPopover;
});

describe("the two top-layer steps of a tooltip and of the table's tip", () => {
  it.each([
    { api: true, dialog: true, popover: "manual" },
    { api: true, dialog: false, popover: null },
    { api: false, dialog: true, popover: null },
    { api: false, dialog: false, popover: null },
  ])("decide alike with the Popover API $api and a dialog $dialog", ({ api, dialog, popover }) => {
    if (api) (HTMLElement.prototype as { showPopover?: () => void }).showPopover = () => {};
    vi.useFakeTimers();
    expect(coreTip(dialog)).toBe(popover);
    clearTheBody();
    expect(tableTip(dialog)).toBe(popover);
  });
});
