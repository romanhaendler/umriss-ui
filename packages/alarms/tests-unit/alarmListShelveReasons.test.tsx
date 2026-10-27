/* The shelve panel offers the application's reasons above a free-text field.
   Checked at the seam a caller has: what `onSnooze` receives. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { AlarmList } from "../src";
import { useTableSelection } from "@umriss-ui/table";
import { alarmModel } from "../src/alarmModel";
import type { Alarm, AlarmType } from "../src/alarmModel";

const NOW = new Date("2026-03-17T10:30:00Z").getTime();
const MIN = 60_000;
const TYPES: AlarmType[] = [{ id: "temp", label: "Furnace temperature too high", priority: "high" }];
const ALARMS: Alarm[] = [{ id: "m1", type: "temp", lifecycle: "active-unacknowledged", raised: NOW - 4 * MIN }];
const REASONS = ["Valve being replaced", "Sensor drifting"];

function Reasons({ onSnooze, reason }: { onSnooze: (...args: unknown[]) => void; reason?: "required" }) {
  const view = alarmModel({ alarms: ALARMS, types: TYPES, asOf: NOW });
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  return (
    <>
      <button onClick={() => selection.toggle("m1")}>tick</button>
      <AlarmList view={view} selection={selection} snoozeDurations={[15 * MIN]} snoozeReasons={REASONS} snoozeReason={reason} onSnooze={onSnooze} />
    </>
  );
}

async function panel(reason?: "required") {
  const onSnooze = vi.fn();
  render(<Reasons onSnooze={onSnooze} reason={reason} />);
  fireEvent.click(screen.getByText("tick"));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Shelve 1 alarm" }));
  });
  return { onSnooze, dialog: await screen.findByRole("dialog") };
}

describe("snoozeReasons", () => {
  it("required: Shelve waits for a choice and reports exactly it", async () => {
    const { onSnooze, dialog } = await panel("required");
    const confirm = within(dialog).getByRole("button", { name: "Shelve" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(within(dialog).getByLabelText("Sensor drifting"));
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(onSnooze).toHaveBeenCalledWith(["m1"], NOW + 15 * MIN, "Sensor drifting");
  });

  it("required: a typed reason serves too, and replaces a choice", async () => {
    const { onSnooze, dialog } = await panel("required");
    fireEvent.click(within(dialog).getByLabelText("Sensor drifting"));
    fireEvent.change(within(dialog).getByLabelText("Other reason"), { target: { value: "  line cleaning " } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Shelve" }));
    expect(onSnooze).toHaveBeenCalledWith(["m1"], NOW + 15 * MIN, "line cleaning");
  });

  it("without snoozeReason neither is needed", async () => {
    const { onSnooze, dialog } = await panel();
    fireEvent.click(within(dialog).getByRole("button", { name: "Shelve" }));
    expect(onSnooze).toHaveBeenCalledWith(["m1"], NOW + 15 * MIN, undefined);
  });
});
