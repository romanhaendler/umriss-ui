/* `min` and `max` on the four pickers: inclusive, by day, in the formats' zone. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker, DateTimePicker } from "../src/components/DatePicker";

const MIN = new Date(2020, 2, 1);
const TODAY = new Date(2026, 9, 26, 12);

beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());
beforeEach(() => vi.setSystemTime(TODAY));

const open = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const day = (label: string) => screen.getByLabelText(label) as HTMLButtonElement;
const active = () => document.querySelector('[data-active="true"]') as HTMLButtonElement;
const options = (name: string) =>
  Array.from((screen.getByRole("combobox", { name }) as HTMLSelectElement).options);

describe("DatePicker with min and max", () => {
  it("offers only the years in range, and a month wholly before min is disabled", () => {
    render(<DatePicker value={new Date(2020, 3, 10)} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("10/04/2020");
    expect(options("Year").map((o) => o.value)).toEqual(["2020", "2021", "2022", "2023", "2024", "2025", "2026"]);
    expect(options("Month")[1]!.disabled).toBe(true);
    expect(options("Month")[2]!.disabled).toBe(false);
    expect(options("Month")[3]!.disabled).toBe(false);
  });

  it("disables the arrow to a month wholly outside", () => {
    render(<DatePicker value={new Date(2020, 2, 10)} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("10/03/2020");
    expect((screen.getByRole("button", { name: "Previous month" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next month" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("draws a day before min aria-disabled and hands nothing out for it", () => {
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2020, 2, 10)} onChange={onChange} min={MIN} max={TODAY} />);
    open("10/03/2020");
    const before = day("Saturday, 29 February 2020");
    expect(before.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(before);
    expect(onChange).not.toHaveBeenCalled();
    expect(day("Sunday, 1 March 2020").getAttribute("aria-disabled")).toBeNull();
  });

  it("keeps PageUp, End and the arrows inside the range", () => {
    render(<DatePicker value={new Date(2020, 2, 15)} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("15/03/2020");
    fireEvent.keyDown(active(), { key: "PageUp" });
    expect(active().getAttribute("aria-label")).toBe("Sunday, 1 March 2020");
    fireEvent.keyDown(active(), { key: "ArrowLeft" });
    expect(active().getAttribute("aria-label")).toBe("Sunday, 1 March 2020");
  });

  it("stops End on the week of today at today", () => {
    render(<DatePicker value={new Date(2026, 9, 26)} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("26/10/2026");
    fireEvent.keyDown(active(), { key: "End" });
    expect(active().getAttribute("aria-label")).toBe("Monday, 26 October 2026");
  });

  it("moves an active day outside to the nearest bound on opening, and shows a value as given", () => {
    render(<DatePicker value={new Date(2019, 5, 5)} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("05/06/2019");
    expect(active().getAttribute("aria-label")).toBe("Sunday, 1 March 2020");
  });

  it("disables Today when today is outside", () => {
    const { unmount } = render(<DatePicker value={null} onChange={vi.fn()} min={MIN} max={TODAY} />);
    open("Select date");
    expect((screen.getByRole("button", { name: "Today" }) as HTMLButtonElement).disabled).toBe(false);
    unmount();
    render(<DatePicker value={null} onChange={vi.fn()} min={MIN} max={new Date(2026, 9, 25)} />);
    open("Select date");
    expect((screen.getByRole("button", { name: "Today" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("refuses a typed date outside, announces the bound and hands out nothing", () => {
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} min={MIN} max={TODAY} />);
    open("Select date");
    const field = screen.getByRole("textbox", { name: "Type a date" });
    fireEvent.change(field, { target: { value: "01/01/2019" } });
    fireEvent.keyDown(field, { key: "Enter" });
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Not between 01/03/2020 and 26/10/2026");
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DateRangePicker with min and max", () => {
  it("disables a preset wholly outside and cuts one that overlaps", () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={null} onChange={onChange} min={MIN} max={TODAY} />);
    open("Select range");
    expect((screen.getByRole("button", { name: "Today" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "This month" }));
    const range = onChange.mock.calls[0]![0] as { from: Date; to: Date };
    expect(range.from.getTime()).toBe(new Date(2026, 9, 1).getTime());
    expect(range.to.getTime()).toBe(new Date(2026, 9, 26).getTime());
  });

  it("disables a preset wholly after max", () => {
    render(<DateRangePicker value={null} onChange={vi.fn()} min={MIN} max={new Date(2026, 8, 30)} />);
    open("Select range");
    expect((screen.getByRole("button", { name: "Today" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "This month" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("DateTimePicker with min and max", () => {
  it("accepts a time on the max day", () => {
    const onChange = vi.fn();
    render(<DateTimePicker value={null} onChange={onChange} min={MIN} max={new Date(2026, 9, 26, 9)} />);
    open("Select date and time");
    fireEvent.click(day("Monday, 26 October 2026"));
    fireEvent.change(screen.getByLabelText("Hour"), { target: { value: "17" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
