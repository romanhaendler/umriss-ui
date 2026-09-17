/* The four pickers as components (library-audit 02).

   Up to here no test renders a picker: the pure modules below them - time,
   range, grid, the value contract - are checked, the interplay in the panel is
   not. That is exactly where the bugs lay: "Now" in the doubled hour, the
   reopening of a later value, Enter in the time field, an overridden preset.

   The time zone stands at Europe/Berlin in vitest.config.ts. The instants are
   built from UTC, because the wall-clock time is precisely what is ambiguous
   here. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
} from "../src/components/DatePicker";
import { LanguageProvider } from "../src/lib/language";

const EARLIER_0230 = new Date("2026-10-25T00:30:00Z"); // 02:30 CEST
const LATER_0230 = new Date("2026-10-25T01:30:00Z"); // 02:30 CET

afterEach(() => vi.useRealTimers());

const openPanel = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const lastValue = (onChange: ReturnType<typeof vi.fn>) =>
  onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];

describe("DateTimePicker - Now", () => {
  it("reports in the doubled hour the instant that is now, to the minute", () => {
    // Only stop the clock: the popover and the calendar need their real timers.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(LATER_0230.getTime() + 40_000));

    const onChange = vi.fn();
    render(<DateTimePicker value={null} onChange={onChange} />);
    openPanel("Select date and time");
    fireEvent.click(screen.getByRole("button", { name: "Now" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((lastValue(onChange) as Date).getTime()).toBe(LATER_0230.getTime());
  });
});

describe("Reopening a later value", () => {
  it("DateTimePicker: Apply gives back the same instant", () => {
    const onChange = vi.fn();
    render(<DateTimePicker value={LATER_0230} onChange={onChange} />);
    openPanel("25/10/2026, 02:30");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect((lastValue(onChange) as Date).getTime()).toBe(LATER_0230.getTime());
  });

  it("DateTimePicker: the earlier one stays the earlier one", () => {
    const onChange = vi.fn();
    render(<DateTimePicker value={EARLIER_0230} onChange={onChange} />);
    openPanel("25/10/2026, 02:30");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect((lastValue(onChange) as Date).getTime()).toBe(EARLIER_0230.getTime());
  });

  it("DateTimeRangePicker: both ends keep their occurrence", () => {
    const onChange = vi.fn();
    // 02:30 CEST to 02:45 CET: the start earlier, the end later.
    const to = new Date("2026-10-25T01:45:00Z");
    render(<DateTimeRangePicker value={{ from: EARLIER_0230, to }} onChange={onChange} presets={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /25\/10\/2026, 02:30/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    const range = lastValue(onChange) as { from: Date; to: Date };
    expect(range.from.getTime()).toBe(EARLIER_0230.getTime());
    expect(range.to.getTime()).toBe(to.getTime());
  });
});

describe("Enter in the time field", () => {
  it("applies in the DateTimePicker as in the DateTimeRangePicker", () => {
    const onChange = vi.fn();
    const value = new Date(2026, 5, 15, 10, 15);
    render(<DateTimePicker value={value} onChange={onChange} />);
    openPanel("15/06/2026, 10:15");
    fireEvent.keyDown(screen.getByLabelText("Minute"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((lastValue(onChange) as Date).getTime()).toBe(value.getTime());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("An overridden preset", () => {
  const WORDING = { presets: { today: "Today" } };

  it("reaches the DateRangePicker", () => {
    render(
      <LanguageProvider wording={WORDING}>
        <DateRangePicker value={null} onChange={() => undefined} />
      </LanguageProvider>,
    );
    openPanel("Select range");
    expect(screen.getByText("Today")).toBeTruthy();
  });

  it("reaches the DateTimeRangePicker as well", () => {
    render(
      <LanguageProvider wording={WORDING}>
        <DateTimeRangePicker value={null} onChange={() => undefined} />
      </LanguageProvider>,
    );
    openPanel("Select range");
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.queryByText("Heute")).toBeNull();
  });
});
