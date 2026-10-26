/* The pickers in the formats' zone. The workspace runs at Europe/Berlin, so
   zones elsewhere (New York, Kolkata) tell the reader's day from the zone's. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker, DateTimePicker } from "../src/components/DatePicker";
import { LanguageProvider } from "../src/lib/language";

const inZone = (timeZone: string, ui: React.ReactNode) =>
  render(<LanguageProvider formats={{ timeZone }}>{ui}</LanguageProvider>);
const open = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls[fn.mock.calls.length - 1]?.[0];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("The value seam", () => {
  it("gives the zone's midnight for a clicked day", () => {
    const onChange = vi.fn();
    inZone("Europe/Berlin", <DatePicker value={null} onChange={onChange} />);
    open("Select date");
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "2026" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: "2" } });
    fireEvent.click(screen.getByLabelText("Tuesday, 17 March 2026"));
    expect((last(onChange) as Date).toISOString()).toBe("2026-03-16T23:00:00.000Z");
  });

  it("is not the reader's midnight under another zone", () => {
    const onChange = vi.fn();
    inZone("America/New_York", <DatePicker value={null} onChange={onChange} />);
    open("Select date");
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "2026" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: "2" } });
    fireEvent.click(screen.getByLabelText("Tuesday, 17 March 2026"));
    expect((last(onChange) as Date).toISOString()).toBe("2026-03-17T04:00:00.000Z");
  });

  it("opens a value on the zone's day, and the typed date goes out the same way", () => {
    const onChange = vi.fn();
    // Midnight in Kolkata on 17 March is the evening of the 16th for the reader.
    inZone("Asia/Kolkata", <DatePicker value={new Date("2026-03-16T18:30:00Z")} onChange={onChange} />);
    open(/17\/03\/2026/);
    expect(screen.getByLabelText("Tuesday, 17 March 2026").getAttribute("aria-pressed")).toBe("true");
    const typed = screen.getByLabelText("Type a date");
    fireEvent.change(typed, { target: { value: "18/03/2026" } });
    fireEvent.keyDown(typed, { key: "Enter" });
    expect((last(onChange) as Date).toISOString()).toBe("2026-03-17T18:30:00.000Z");
  });

  it("shows the typed date's placeholder as the 25th", () => {
    inZone("Pacific/Kiritimati", <DatePicker value={null} onChange={vi.fn()} />);
    open("Select date");
    expect(screen.getByPlaceholderText("25/12/2031")).toBeTruthy();
  });
});

describe("The doubled and the missing hour, in the zone", () => {
  const pickTime = (day: string, hour: string, minute: string) => {
    open("Select date and time");
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "2026" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: day.split("|")[0] } });
    fireEvent.click(screen.getByLabelText(day.split("|")[1]!));
    // A field takes one digit at a time.
    for (const [label, digits] of [["Hour", hour], ["Minute", minute]] as const) {
      fireEvent.focus(screen.getByLabelText(label));
      fireEvent.change(screen.getByLabelText(label), { target: { value: digits[0] } });
      fireEvent.change(screen.getByLabelText(label), { target: { value: digits } });
    }
  };

  it("reports 02:30 on 8 March as missing in New York", () => {
    inZone("America/New_York", <DateTimePicker value={null} onChange={vi.fn()} />);
    pickTime("2|Sunday, 8 March 2026", "02", "30");
    expect(screen.getByText(/does not exist/i)).toBeTruthy();
  });

  it("offers both occurrences of 01:30 on 1 November in New York, and keeps the later", () => {
    const onChange = vi.fn();
    inZone("America/New_York", <DateTimePicker value={null} onChange={onChange} />);
    pickTime("10|Sunday, 1 November 2026", "01", "30");
    expect(screen.getByRole("button", { name: /GMT-4/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /GMT-5/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    const later = last(onChange) as Date;
    expect(later.toISOString()).toBe("2026-11-01T06:30:00.000Z");

    onChange.mockClear();
    cleanup();
    render(
      <LanguageProvider formats={{ timeZone: "America/New_York" }}>
        <DateTimePicker value={later} onChange={onChange} />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /01\/11\/2026, 01:30/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect((last(onChange) as Date).toISOString()).toBe("2026-11-01T06:30:00.000Z");
  });
});

describe("The zone's today", () => {
  it("ends 'Last 7 days' on the zone's today and marks it", () => {
    // 23:30 in Berlin on 10 June is 03:00 on the 11th in Kolkata.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-10T21:30:00Z"));
    const onChange = vi.fn();
    inZone("Asia/Kolkata", <DateRangePicker value={null} onChange={onChange} />);
    open("Select range");
    expect(document.querySelector('[aria-current="date"]')?.getAttribute("aria-label")).toBe("Thursday, 11 June 2026");
    fireEvent.click(screen.getByRole("button", { name: "Last 7 days" }));
    const range = last(onChange) as { from: Date; to: Date };
    expect(range.to.toISOString()).toBe("2026-06-10T18:30:00.000Z");
    expect(range.from.toISOString()).toBe("2026-06-04T18:30:00.000Z");
  });
});

describe("The label and the warning", () => {
  it("names the zone in the panel and the trigger's description where the reader's is another", () => {
    const original = Intl.DateTimeFormat.prototype.resolvedOptions;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (this: Intl.DateTimeFormat) {
      const options = original.call(this);
      return options.locale === "en" ? options : { ...options, timeZone: "America/Chicago" };
    });
    inZone("Europe/Berlin", <DatePicker value={null} onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Select date" });
    expect(document.getElementById(trigger.getAttribute("aria-describedby")!)?.textContent).toBe("CET");
    open("Select date");
    expect(screen.getAllByText("CET").length).toBe(2);
  });

  it("warns once per picker for a value off the zone's midnight, naming the zone", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    // The reader's midnight in Berlin is 18:00 the evening before in New York.
    const value = new Date(2026, 5, 15);
    const { rerender } = inZone("America/New_York", <DatePicker value={value} onChange={vi.fn()} />);
    rerender(
      <LanguageProvider formats={{ timeZone: "America/New_York" }}>
        <DatePicker value={new Date(2026, 5, 16)} onChange={vi.fn()} />
      </LanguageProvider>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/America\/New_York/);
    expect(warn.mock.calls[0]![0]).toMatch(/midnight/);
  });

  it("does not warn in a production build", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");
    inZone("America/New_York", <DatePicker value={new Date(2026, 5, 15)} onChange={vi.fn()} />);
    vi.unstubAllEnvs();
    expect(warn).not.toHaveBeenCalled();
  });
});
