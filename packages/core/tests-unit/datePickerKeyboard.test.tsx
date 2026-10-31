/* The pickers' keyboard and voice: the focus follows a day into another month, a pasted
   time is taken, the time fields are spinbuttons, Tab leaves an open panel, the value is
   described and said, and an Invalid Date is shown as empty. The workspace runs at Europe/Berlin. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker } from "../src/components/DatePicker";
import { FormField } from "../src/components/FormField";
import { resetAnnouncer, ANNOUNCE_REST } from "../src/lib/announce";
import { resolveLocalTime } from "../src/components/DatePicker/time";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  resetAnnouncer();
});

const open = (name = "Select date") => fireEvent.click(screen.getByRole("button", { name }));
const day = (label: string) => screen.getByRole("button", { name: label });

describe("the focus follows the active day into another month", () => {
  it("keeps focus after PageUp from 31 October", () => {
    render(<DatePicker defaultValue={new Date(2026, 9, 31)} />);
    open("31/10/2026");
    fireEvent.keyDown(day("Saturday, 31 October 2026"), { key: "PageUp" });
    expect(document.activeElement).toBe(day("Wednesday, 30 September 2026"));
  });

  it("keeps focus after ArrowDown from 28 November into December", () => {
    render(<DatePicker defaultValue={new Date(2026, 10, 28)} />);
    open("28/11/2026");
    fireEvent.keyDown(day("Saturday, 28 November 2026"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(day("Saturday, 5 December 2026"));
    expect(document.activeElement).not.toBe(document.body);
  });
});

describe("the time fields", () => {
  const fields = () => ({
    hour: screen.getByRole("spinbutton", { name: "Hour" }) as HTMLInputElement,
    minute: screen.getByRole("spinbutton", { name: "Minute" }) as HTMLInputElement,
  });

  it("are spinbuttons with value, min and max", () => {
    render(<DateTimePicker defaultValue={new Date(2026, 5, 10, 9, 5)} />);
    open("10/06/2026, 09:05");
    const { hour, minute } = fields();
    expect([hour.getAttribute("aria-valuenow"), hour.getAttribute("aria-valuemin"), hour.getAttribute("aria-valuemax")]).toEqual(["9", "0", "23"]);
    expect(minute.getAttribute("aria-valuemax")).toBe("59");
  });

  it("take a pasted number, clamped, each its own part of a pasted time", () => {
    render(<DateTimePicker defaultValue={new Date(2026, 5, 10, 9, 5)} />);
    open("10/06/2026, 09:05");
    const { hour, minute } = fields();
    const paste = (el: HTMLElement, text: string) => fireEvent.paste(el, { clipboardData: { getData: () => text } });
    paste(minute, "30");
    expect(minute.value).toBe("30");
    paste(hour, "14");
    expect(hour.value).toBe("14");
    paste(hour, "17:45");
    expect(hour.value).toBe("17");
    paste(minute, "17:45");
    expect(minute.value).toBe("45");
    paste(minute, "99");
    expect(minute.value).toBe("59");
  });
});

describe("Tab out of an open panel", () => {
  it("closes it and puts the focus on the trigger, from which the browser moves on", () => {
    render(<DatePicker defaultValue={new Date(2026, 5, 10)} />);
    open("10/06/2026");
    const last = screen.getByRole("button", { name: "Today" });
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "10/06/2026" }));
    expect(screen.getByRole("button", { name: "10/06/2026" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("leaves a Tab between two stops of the panel alone", () => {
    render(<DatePicker defaultValue={new Date(2026, 5, 10)} />);
    open("10/06/2026");
    const typed = screen.getByRole("textbox", { name: "Type a date" });
    typed.focus();
    fireEvent.keyDown(typed, { key: "Tab" });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("what was picked is described and said", () => {
  it("describes the value of a labelled field and says a new one", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <FormField label="Birthday">
        <DatePicker value={null} />
      </FormField>,
    );
    rerender(
      <FormField label="Birthday">
        <DatePicker value={new Date(2026, 5, 10)} />
      </FormField>,
    );
    const trigger = screen.getByRole("button", { name: /Birthday/ });
    const described = trigger.getAttribute("aria-describedby")!.split(" ");
    expect(described.some((id) => document.getElementById(id)?.textContent === "10/06/2026")).toBe(true);
    act(() => void vi.advanceTimersByTime(ANNOUNCE_REST + 10));
    expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe("Selected 10/06/2026");
  });

  it("says a range", () => {
    vi.useFakeTimers();
    const { rerender } = render(<DateRangePicker value={null} />);
    rerender(<DateRangePicker value={{ from: new Date(2026, 5, 10), to: new Date(2026, 5, 12) }} />);
    act(() => void vi.advanceTimersByTime(ANNOUNCE_REST + 10));
    expect(document.querySelector("[data-umriss-announcer]")?.textContent).toBe("Selected 10/06/2026–12/06/2026");
  });
});

describe("an Invalid Date as the value", () => {
  it.each([
    ["DatePicker", <DatePicker key="a" value={new Date("nope")} />],
    ["DateTimePicker", <DateTimePicker key="b" value={new Date("nope")} />],
    ["DateRangePicker", <DateRangePicker key="c" value={{ from: new Date("nope"), to: new Date() }} />],
    ["DateTimeRangePicker", <DateTimeRangePicker key="d" value={{ from: new Date(), to: new Date("nope") }} />],
  ])("shows %s empty and warns instead of throwing", (_name, ui) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(() => render(ui)).not.toThrow();
    expect(screen.getByRole("button").textContent).toMatch(/^(Select|Pick)/i);
    expect(warn).toHaveBeenCalled();
  });
});

describe("a 30-minute daylight-saving change", () => {
  it("is ambiguous where the clocks fall back by half an hour", () => {
    expect(resolveLocalTime(2026, 3, 5, 1, 45, 0, "Australia/Lord_Howe").kind).toBe("ambiguous");
  });
});
