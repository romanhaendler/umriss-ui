/* The DatePicker panel's typed field. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, DateRangePicker } from "../src/components/DatePicker";
import { LanguageProvider } from "../src/lib/language";

const open = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const field = () => screen.getByRole("textbox", { name: "Type a date" }) as HTMLInputElement;
const type = (text: string) => fireEvent.change(field(), { target: { value: text } });
const enter = () => fireEvent.keyDown(field(), { key: "Enter" });

describe("A date typed in the panel", () => {
  it("hands out local midnight on Enter and closes the panel", () => {
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    open("Select date");
    type("17.03.1985");
    enter();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]![0] as Date).getTime()).toBe(new Date(1985, 2, 17).getTime());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the date in the grid as soon as it is complete", () => {
    render(<DatePicker value={new Date(2026, 9, 14)} onChange={vi.fn()} />);
    open("14/10/2026");
    type("17031985");
    expect(screen.getByLabelText("Sunday, 17 March 1985")).toBeTruthy();
    expect(document.querySelector('[data-active="true"]')?.getAttribute("aria-label")).toBe("Sunday, 17 March 1985");
  });

  it("marks a text that is no date, announces it and hands out nothing", () => {
    const onChange = vi.fn();
    render(<DatePicker value={null} onChange={onChange} />);
    open("Select date");
    type("31/02/2026");
    enter();
    expect(field().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Not a date");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    type("31/01/2026");
    expect(field().getAttribute("aria-invalid")).toBeNull();
  });

  it("takes a digit typed on the grid into the field", () => {
    render(<DatePicker value={new Date(2026, 9, 14)} onChange={vi.fn()} />);
    open("14/10/2026");
    const day = document.querySelector<HTMLButtonElement>('[data-active="true"]')!;
    expect(document.activeElement).toBe(day);
    fireEvent.keyDown(day, { key: "1" });
    expect(document.activeElement).toBe(field());
    expect(field().value).toBe("1");
  });

  it("does not focus itself on opening, and its placeholder is a sample date", () => {
    render(<DatePicker value={null} onChange={vi.fn()} />);
    open("Select date");
    expect(document.activeElement).not.toBe(field());
    expect(field().placeholder).toBe("25/12/2031");
  });

  it("reads German", async () => {
    const { GERMAN_WORDING, GERMAN_FORMATS } = await import("../src/lib/language/de");
    const onChange = vi.fn();
    render(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <DatePicker value={null} onChange={onChange} />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Datum wählen" }));
    const input = screen.getByRole("textbox", { name: "Datum eingeben" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "99.99.2026" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("alert").textContent).toBe("Kein gültiges Datum");
  });

  it("is not offered by the range picker", () => {
    render(<DateRangePicker value={null} onChange={vi.fn()} />);
    open("Select range");
    expect(screen.queryByRole("textbox", { name: "Type a date" })).toBeNull();
  });
});
