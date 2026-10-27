/* The list works without a mouse: A, Shift+A and S act on the focused alarm,
   the selection or what the list shows, and the live region keeps quiet. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useTableSelection } from "@umriss-ui/table";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const T0 = Date.UTC(2026, 2, 17, 10, 30, 0);
const SECOND = 1000;
const MIN = 60_000;
const TYPES: AlarmType[] = [{ id: "a", label: "Arrival", priority: "high" }];
const alarm = (n: number, raised = T0 - n * SECOND): Alarm => ({ id: `a${n}`, type: "a", lifecycle: "active-unacknowledged", raised });

function Host({
  alarms,
  asOf = T0,
  onAcknowledge = () => {},
  onSnooze,
}: {
  alarms: readonly Alarm[];
  asOf?: number;
  onAcknowledge?: (ids: readonly string[]) => void;
  onSnooze?: () => void;
}) {
  const view = alarmModel({ alarms, types: TYPES, asOf });
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  return (
    <>
      <input aria-label="note" />
      <AlarmList
        view={view}
        selection={selection}
        onAcknowledge={onAcknowledge}
        onSnooze={onSnooze}
        snoozeDurations={onSnooze ? [15 * MIN] : undefined}
      />
    </>
  );
}

const three = [alarm(1), alarm(2), alarm(3)];

afterEach(() => vi.restoreAllMocks());

describe("Single keys", () => {
  it("A acknowledges the focused alarm", () => {
    const onAcknowledge = vi.fn();
    render(<Host alarms={three} onAcknowledge={onAcknowledge} />);
    fireEvent.keyDown(screen.getAllByRole("rowheader")[1]!, { key: "a" });
    expect(onAcknowledge).toHaveBeenCalledWith(["a2"]);
  });

  it("A in a field beside the list reports nothing", () => {
    const onAcknowledge = vi.fn();
    render(<Host alarms={three} onAcknowledge={onAcknowledge} />);
    fireEvent.keyDown(screen.getByLabelText("note"), { key: "a" });
    expect(onAcknowledge).not.toHaveBeenCalled();
  });
});

describe("Acknowledge all", () => {
  it("names the selected alarms and reports the ids fixed at opening", () => {
    const onAcknowledge = vi.fn();
    const props = { onAcknowledge };
    const { rerender } = render(<Host alarms={three} {...props} />);
    for (const box of screen.getAllByRole("checkbox").slice(1)) fireEvent.click(box);
    fireEvent.keyDown(screen.getAllByRole("rowheader")[0]!, { key: "A", shiftKey: true });
    expect(screen.getByText(DEFAULT_WORDING.alarmAcknowledgeSelected(3))).toBeTruthy();
    rerender(<Host alarms={[...three, alarm(4)]} {...props} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: DEFAULT_WORDING.alarmAcknowledgeConfirm }));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
    expect([...onAcknowledge.mock.calls[0]![0]].sort()).toEqual(["a1", "a2", "a3"]);
  });

  it("counts only the rows in the visible area without a selection", () => {
    const onAcknowledge = vi.fn();
    const rows = Array.from({ length: 6 }, (_, i) => alarm(i + 1));
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const index = this.dataset.alarmId ? Number(this.dataset.alarmId.slice(1)) - 1 : -1;
      const top = index < 0 ? 0 : index * 30;
      const bottom = index < 0 ? 90 : top + 30;
      return { top, bottom, left: 0, right: 10, width: 10, height: bottom - top, x: 0, y: top, toJSON() {} } as DOMRect;
    });
    render(<Host alarms={rows} onAcknowledge={onAcknowledge} />);
    fireEvent.keyDown(screen.getAllByRole("rowheader")[0]!, { key: "A", shiftKey: true });
    expect(screen.getByText(DEFAULT_WORDING.alarmAcknowledgeInView(3))).toBeTruthy();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: DEFAULT_WORDING.alarmAcknowledgeConfirm }));
    expect(onAcknowledge).toHaveBeenCalledWith(["a1", "a2", "a3"]);
  });
});

describe("Shelve by key", () => {
  it("S opens the panel for the focused alarm and Escape returns to the cell", () => {
    render(<Host alarms={three} onSnooze={() => {}} />);
    const cell = screen.getAllByRole("rowheader")[1]!;
    cell.focus();
    fireEvent.keyDown(cell, { key: "s" });
    expect(screen.getByRole("dialog", { name: DEFAULT_WORDING.alarmSnoozeMany(1) })).toBeTruthy();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(cell);
  });
});

describe("The live region", () => {
  it("changes at most once per two seconds of as-of time", () => {
    const at = (s: number, n: number) => (
      <Host alarms={Array.from({ length: n }, (_, i) => alarm(i + 1, T0 + s * SECOND - 10 * MIN))} asOf={T0 + s * SECOND} />
    );
    const text = (container: HTMLElement) => container.querySelector("[aria-live]")?.textContent;
    const { container, rerender } = render(at(0, 1));
    const seen = [text(container)];
    for (const [s, n] of [[1, 2], [2, 3], [3, 4], [4, 4]] as const) {
      rerender(at(s, n));
      seen.push(text(container));
    }
    const say = DEFAULT_WORDING.alarmActiveUnacknowledged;
    expect(seen).toEqual([say(1), say(1), say(3), say(3), say(4)]);
  });
});
