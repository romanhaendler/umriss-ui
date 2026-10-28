/* Shift+A and S act on the whole selection, also on the alarms a bounded
   list has not rendered: the cut is made over the filtered set, not the DOM. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useTableSelection } from "@umriss-ui/table";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../src";
import type { Alarm, AlarmType } from "../src";

const T0 = Date.UTC(2026, 2, 17, 10, 30, 0);
const TYPES: AlarmType[] = [{ id: "t", label: "Level high", priority: "medium" }];
const ALARMS: Alarm[] = Array.from({ length: 500 }, (_, i) => ({ id: `a${i}`, type: "t", lifecycle: "active-unacknowledged" as const, raised: T0 - i * 1000 }));

function Host({ onAcknowledge = () => {} }: { onAcknowledge?: (ids: readonly string[]) => void }) {
  const view = alarmModel({ alarms: ALARMS, types: TYPES, asOf: T0 });
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  return <AlarmList view={view} selection={selection} maxHeight="300px" onAcknowledge={onAcknowledge} onSnooze={() => {}} snoozeDurations={[60_000]} />;
}

const selectAllThenFocusFirst = () => {
  fireEvent.click(screen.getAllByRole("checkbox")[0]!);
  const cell = screen.getAllByRole("rowheader")[0]!;
  cell.focus();
  return cell;
};

describe("Keys on a bounded list with a selection", () => {
  it("Shift+A reports every selected alarm, rendered or not", () => {
    const onAcknowledge = vi.fn();
    render(<Host onAcknowledge={onAcknowledge} />);
    expect(screen.getAllByRole("rowheader").length).toBeLessThan(100);
    fireEvent.keyDown(selectAllThenFocusFirst(), { key: "A", shiftKey: true });
    expect(screen.getByText(DEFAULT_WORDING.alarmAcknowledgeSelected(500))).toBeTruthy();
  });

  it("S opens the panel for every selected alarm, rendered or not", () => {
    render(<Host />);
    fireEvent.keyDown(selectAllThenFocusFirst(), { key: "s" });
    expect(screen.getByRole("dialog", { name: DEFAULT_WORDING.alarmSnoozeMany(500) })).toBeTruthy();
  });
});
