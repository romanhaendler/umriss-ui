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
  DatePicker,
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

/* The grid has one tab stop, on the active day. Paging used to leave that day
   in the month paged away from, and with it the stop: after the arrow buttons
   Tab went past the grid. The active day now travels along. */
describe("Paging with the arrows", () => {
  it("takes the active day - and the tab stop - into the new month", () => {
    render(<DatePicker value={new Date(2026, 0, 31)} onChange={vi.fn()} />);
    openPanel("31/01/2026");
    const next = screen.getByRole("button", { name: "Next month" });
    next.focus();
    fireEvent.click(next);
    const stop = document.querySelector<HTMLButtonElement>('[role="dialog"] button[tabindex="0"]');
    expect(stop?.getAttribute("aria-label")).toBe("Saturday, 28 February 2026");
    // The focus stays on the arrow that paged.
    expect(document.activeElement).toBe(next);
  });

  it("leaves the focus on the arrow in a range picker too", () => {
    render(<DateRangePicker value={null} onChange={vi.fn()} />);
    openPanel("Select range");
    const next = screen.getByRole("button", { name: "Next month" });
    next.focus();
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
  });
});

const stop = () =>
  document.querySelector<HTMLButtonElement>('[role="dialog"] button[tabindex="0"]')?.getAttribute("aria-label");
const key = (k: string, init: object = {}) =>
  fireEvent.keyDown(document.querySelector<HTMLButtonElement>('[role="dialog"] button[tabindex="0"]')!, { key: k, ...init });

describe("The calendar's head jumps to a month and a year", () => {
  it("shows the chosen year and month with the tab stop in it", () => {
    render(<DatePicker value={new Date(2026, 9, 31)} onChange={vi.fn()} />);
    openPanel("31/10/2026");
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "1985" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: "1" } });
    expect(stop()).toBe("Thursday, 28 February 1985");
    expect(screen.getByRole("combobox", { name: "Year" })).toHaveProperty("value", "1985");
  });

  it("lists 100 years either side of today and always the year in view", () => {
    render(<DatePicker value={new Date(2500, 0, 1)} onChange={vi.fn()} />);
    openPanel("01/01/2500");
    const years = Array.from((screen.getByRole("combobox", { name: "Year" }) as HTMLSelectElement).options).map((o) => o.value);
    const now = new Date().getFullYear();
    expect(years).toContain(String(now - 100));
    expect(years).toContain(String(now + 100));
    expect(years).toContain("2500");
  });

  it("is carried by the left month of a pair, which the right follows", () => {
    render(<DateRangePicker value={null} onChange={vi.fn()} />);
    openPanel("Select range");
    expect(screen.getAllByRole("combobox", { name: "Year" })).toHaveLength(1);
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "1985" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: "2" } });
    expect(screen.getByLabelText("Sunday, 17 March 1985")).toBeTruthy();
    expect(screen.getByLabelText("Monday, 15 April 1985")).toBeTruthy();
  });

  it("opens no own list of its year under a finger", () => {
    render(<DatePicker value={new Date(2026, 9, 31)} onChange={vi.fn()} />);
    openPanel("31/10/2026");
    const year = screen.getByRole("combobox", { name: "Year" });
    fireEvent.pointerDown(year, { pointerType: "touch", button: 0 });
    expect(fireEvent.mouseDown(year, { button: 0 })).toBe(true);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("reads German in the German wording and formats", async () => {
    const { GERMAN_WORDING, GERMAN_FORMATS } = await import("../src/lib/language/de");
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <DatePicker value={new Date(2026, 2, 17)} onChange={vi.fn()} />
      </LanguageProvider>,
    );
    openPanel("17.03.2026");
    expect(screen.getByRole("combobox", { name: "Jahr" })).toBeTruthy();
    expect((screen.getByRole("combobox", { name: "Monat" }) as HTMLSelectElement).selectedOptions[0]?.text).toBe("März");
  });

  it("takes monthName from an override", () => {
    const formats = { monthName: () => "Mmm" };
    render(
      <LanguageProvider formats={formats}>
        <DatePicker value={new Date(2026, 2, 17)} onChange={vi.fn()} />
      </LanguageProvider>,
    );
    openPanel("17/03/2026");
    expect((screen.getByRole("combobox", { name: "Month" }) as HTMLSelectElement).selectedOptions[0]?.text).toBe("Mmm");
  });
});

describe("The grid's keys", () => {
  it("PageUp and PageDown move a month, keeping the day, across a year", () => {
    render(<DatePicker value={new Date(2026, 0, 31)} onChange={vi.fn()} />);
    openPanel("31/01/2026");
    key("PageUp");
    expect(stop()).toBe("Wednesday, 31 December 2025");
    key("PageDown");
    key("PageDown");
    expect(stop()).toBe("Saturday, 28 February 2026");
  });

  it("Shift with them moves a year", () => {
    render(<DatePicker value={new Date(2024, 1, 29)} onChange={vi.fn()} />);
    openPanel("29/02/2024");
    key("PageDown", { shiftKey: true });
    expect(stop()).toBe("Friday, 28 February 2025");
    key("PageUp", { shiftKey: true });
    expect(stop()).toBe("Wednesday, 28 February 2024");
  });

  it("Home and End go to Monday and Sunday of the week, across a month", () => {
    render(<DatePicker value={new Date(2026, 2, 1)} onChange={vi.fn()} />);
    openPanel("01/03/2026"); // a Sunday
    key("Home");
    expect(stop()).toBe("Monday, 23 February 2026");
    key("End");
    expect(stop()).toBe("Sunday, 1 March 2026");
  });
});
