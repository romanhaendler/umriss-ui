/* The typed field's keyboard, the midnight warning without a named zone, and
   `min`/`max` under a named zone. The workspace runs at Europe/Berlin. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "../src/components/DatePicker";
import { LanguageProvider } from "../src/lib/language";

afterEach(() => vi.restoreAllMocks());

describe("the typed field", () => {
  it("opens the text keyboard, which has the separators a date is typed with", () => {
    render(<DatePicker value={null} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("textbox", { name: "Type a date" }).hasAttribute("inputmode")).toBe(false);
  });
});

describe("the midnight warning", () => {
  it("is silent when no zone is named", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<DatePicker value={new Date()} onChange={vi.fn()} />);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("min and max under a named zone", () => {
  // New York is UTC-4 in June; the bounds are 02:00 in Berlin, the evening before in New York.
  const zoned = (ui: React.ReactNode) =>
    render(<LanguageProvider formats={{ timeZone: "America/New_York" }}>{ui}</LanguageProvider>);
  const disabled = (label: string) => screen.getByLabelText(label).getAttribute("aria-disabled") === "true";

  it("takes max as the zone's day, not the reader's", () => {
    zoned(<DatePicker value={new Date("2026-06-10T04:00:00Z")} onChange={vi.fn()} max={new Date("2026-06-16T00:00:00Z")} />);
    fireEvent.click(screen.getByRole("button", { name: "10/06/2026" }));
    expect(disabled("Monday, 15 June 2026")).toBe(false);
    expect(disabled("Tuesday, 16 June 2026")).toBe(true);
  });

  it("takes min as the zone's day, not the reader's", () => {
    zoned(<DatePicker value={new Date("2026-06-10T04:00:00Z")} onChange={vi.fn()} min={new Date("2026-06-09T02:00:00Z")} />);
    fireEvent.click(screen.getByRole("button", { name: "10/06/2026" }));
    expect(disabled("Sunday, 7 June 2026")).toBe(true);
    expect(disabled("Monday, 8 June 2026")).toBe(false);
  });
});
