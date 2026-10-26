/* `clearable` governs clearing as a whole: without it no picker offers a way to empty its value,
   neither the trigger's cross nor the panel's Clear. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker } from "../src/components/DatePicker";

const day = new Date(2026, 5, 10);
const range = { from: new Date(2026, 5, 10), to: new Date(2026, 5, 12) };

const cases: [string, (clearable: boolean, onChange: () => void) => React.ReactElement][] = [
  ["DatePicker", (clearable, onChange) => <DatePicker value={day} onChange={onChange} clearable={clearable} />],
  ["DateTimePicker", (clearable, onChange) => <DateTimePicker value={day} onChange={onChange} clearable={clearable} />],
  ["DateRangePicker", (clearable, onChange) => <DateRangePicker value={range} onChange={onChange} clearable={clearable} />],
  [
    "DateTimeRangePicker",
    (clearable, onChange) => <DateTimeRangePicker value={range} onChange={onChange} clearable={clearable} presets={[]} />,
  ],
];

describe.each(cases)("%s", (_name, make) => {
  it("has no Clear in the open panel without clearable", () => {
    render(make(false, vi.fn()));
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("empties the value with the panel's Clear under clearable", () => {
    const onChange = vi.fn();
    render(make(true, onChange));
    fireEvent.click(screen.getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
