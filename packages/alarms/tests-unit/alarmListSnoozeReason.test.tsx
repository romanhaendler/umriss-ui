/* Snoozing with a reason: `snoozeReason` turns the menu of durations into a
   panel. Checked at the seam a caller has - what `onSnooze` receives. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { AlarmList } from "../src";
import { useTableSelection } from "@umriss-ui/table";
import { alarmModel, snooze } from "../src/alarmModel";
import type { Alarm, AlarmType } from "../src/alarmModel";

const NOW = new Date("2026-03-17T10:30:00Z").getTime();
const MIN = 60_000;
const TYPES: AlarmType[] = [{ id: "temp", label: "Furnace temperature too high", priority: "high" }];
const ALARMS: Alarm[] = [{ id: "m1", type: "temp", lifecycle: "active-unacknowledged", raised: NOW - 4 * MIN }];

function List({ reason, onSnooze }: { reason?: "optional" | "required"; onSnooze: (...args: unknown[]) => void }) {
  const view = alarmModel({ alarms: ALARMS, types: TYPES, asOf: NOW });
  const selection = useTableSelection(view.filtered.map((row) => row.id));
  return (
    <>
      <button onClick={() => selection.toggle("m1")}>tick</button>
      <AlarmList view={view} selection={selection} snoozeDurations={[15 * MIN, 60 * MIN]} snoozeReason={reason} onSnooze={onSnooze} />
    </>
  );
}

async function open(reason?: "optional" | "required") {
  const onSnooze = vi.fn();
  render(<List reason={reason} onSnooze={onSnooze} />);
  fireEvent.click(screen.getByText("tick"));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Shelve 1 alarm" }));
  });
  return onSnooze;
}

describe("snoozeReason", () => {
  it("without it the menu reports at once, with two arguments", async () => {
    const onSnooze = vi.fn();
    render(<List onSnooze={onSnooze} />);
    fireEvent.click(screen.getByText("tick"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Shelve 1 alarm" }));
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "15 min" }));
    expect(onSnooze).toHaveBeenCalledWith(["m1"], NOW + 15 * MIN);
    expect(onSnooze.mock.calls[0]).toHaveLength(2);
  });

  it("optional: an empty reason is undefined, a typed one is trimmed", async () => {
    const onSnooze = await open("optional");
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Shelve" }));
    expect(onSnooze).toHaveBeenLastCalledWith(["m1"], NOW + 15 * MIN, undefined);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Shelve 1 alarm" }));
    });
    const again = await screen.findByRole("dialog");
    fireEvent.click(within(again).getByLabelText("1 hr"));
    fireEvent.change(within(again).getByLabelText("Reason"), { target: { value: "  known fault  " } });
    fireEvent.submit(within(again).getByLabelText("Reason"));
    expect(onSnooze).toHaveBeenLastCalledWith(["m1"], NOW + 60 * MIN, "known fault");
  });

  it("required: the button is disabled until there is text", async () => {
    const onSnooze = await open("required");
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Shelve" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText(/Reason/), { target: { value: "   " } });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText(/Reason/), { target: { value: "x" } });
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(onSnooze).toHaveBeenCalledWith(["m1"], NOW + 15 * MIN, "x");
  });

  it("takes the focus in, and Escape reports nothing and gives it back", async () => {
    const onSnooze = await open("optional");
    const dialog = await screen.findByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
    expect(onSnooze).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Shelve 1 alarm" }));
  });
});

describe("snooze() keeps the reason", () => {
  it("stores it on the record, and leaves the key off without one", () => {
    expect(snooze(ALARMS[0]!, NOW, "J. Keller", "known fault")).toMatchObject({ snooze: { reason: "known fault" } });
    expect("reason" in (snooze(ALARMS[0]!, NOW, "J. Keller").snooze ?? {})).toBe(false);
  });
});
