/* The week's first day: in the formats, and in the month grid, its Home/End
   keys and the weekday heads. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker, DateTimePicker } from "../src/components/DatePicker";
import { monthGrid, startOfWeek } from "../src/components/DatePicker/grid";
import { DEFAULT_FORMATS, LanguageProvider, formatsFor } from "../src/lib/language";
import { GERMAN_FORMATS } from "../src/lib/language/de";

afterEach(() => vi.restoreAllMocks());

const iso = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

describe("formats' weekStart", () => {
  it("is Monday in the English and German sets", () => {
    expect(DEFAULT_FORMATS.weekStart).toBe(1);
    expect(GERMAN_FORMATS.weekStart).toBe(1);
  });

  it("is the locale's first day where the runtime reports week info", () => {
    vi.spyOn(Intl, "Locale").mockImplementation(function () { return ({ getWeekInfo: () => ({ firstDay: 7 }) }) as unknown as Intl.Locale; });
    expect(formatsFor("en-US", "Europe/Paris").weekStart).toBe(7);
  });

  it("is the old weekInfo property's first day where only that exists", () => {
    vi.spyOn(Intl, "Locale").mockImplementation(function () { return ({ weekInfo: { firstDay: 6 } }) as unknown as Intl.Locale; });
    expect(formatsFor("ar-QA", "Europe/Paris").weekStart).toBe(6);
  });

  it("is Monday where the runtime has no week info", () => {
    vi.spyOn(Intl, "Locale").mockImplementation(function () { return ({}) as unknown as Intl.Locale; });
    expect(formatsFor("en-US", "Asia/Tokyo").weekStart).toBe(1);
  });
});

describe("the grid by weekStart", () => {
  it("begins a Sunday-first month on the Sunday", () => {
    expect(iso(monthGrid(new Date(2026, 2, 1), 7)[0]!)).toBe("2026-3-1");
    expect(iso(monthGrid(new Date(2026, 2, 1), 1)[0]!)).toBe("2026-2-23");
    expect(iso(startOfWeek(new Date(2026, 2, 17), 7))).toBe("2026-3-15");
  });
});

describe("the calendar by weekStart", () => {
  const open = () => {
    render(
      <LanguageProvider formats={{ weekStart: 7 }}>
        <DatePicker value={new Date(2026, 2, 17)} onChange={vi.fn()} />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "17/03/2026" }));
  };

  it("puts Sunday first and 17 March under Tuesday", () => {
    open();
    const heads = [...document.querySelectorAll<HTMLElement>('[class*="weekdays"] span')].map((s) => s.textContent);
    const cells = [...document.querySelectorAll<HTMLElement>('[class*="grid"] button')];
    const col = cells.findIndex((c) => c.getAttribute("aria-label")?.includes("17 March 2026")) % 7;
    expect(heads[col]).toBe("Tue");
    expect(heads[0]).toBe("Sun");
  });

  it("sends Home and End to Sunday and Saturday", () => {
    open();
    const active = () => document.querySelector<HTMLElement>('[data-active="true"]')!;
    fireEvent.keyDown(active(), { key: "Home" });
    expect(active().getAttribute("aria-label")).toContain("15 March");
    fireEvent.keyDown(active(), { key: "End" });
    expect(active().getAttribute("aria-label")).toContain("21 March");
  });
});

describe.each([
  ["DateRangePicker", () => <DateRangePicker value={{ from: new Date(2026, 2, 17), to: new Date(2026, 2, 17) }} onChange={vi.fn()} />],
  ["DateTimePicker", () => <DateTimePicker value={new Date(2026, 2, 17, 9, 30)} onChange={vi.fn()} />],
])("the %s calendar by weekStart", (_name, picker) => {
  const open = () => {
    render(<LanguageProvider formats={{ weekStart: 7 }}>{picker()}</LanguageProvider>);
    fireEvent.click(screen.getAllByRole("button")[0]!);
  };

  it("puts Sunday first and 17 March under Tuesday", () => {
    open();
    const heads = [...document.querySelectorAll<HTMLElement>('[class*="weekdays"] span')].map((s) => s.textContent);
    const cells = [...document.querySelectorAll<HTMLElement>('[class*="grid"] button')];
    const col = cells.findIndex((c) => c.getAttribute("aria-label")?.includes("17 March 2026")) % 7;
    expect(heads[0]).toBe("Sun");
    expect(heads[col]).toBe("Tue");
  });

  it("sends Home and End to Sunday and Saturday", () => {
    open();
    const active = () => document.querySelector<HTMLElement>('[data-active="true"]')!;
    fireEvent.keyDown(active(), { key: "Home" });
    expect(active().getAttribute("aria-label")).toContain("15 March");
    fireEvent.keyDown(active(), { key: "End" });
    expect(active().getAttribute("aria-label")).toContain("21 March");
  });
});
