import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NumberInput, LanguageProvider } from "../src";
import { formatsFor, separatorsOf } from "../src/lib/language";
import { parseNumber, clampNumber, filterInput } from "../src/components/NumberInput/number";
afterEach(cleanup);

describe("p29 number round trip", () => {
  for (const loc of ["en-GB", "de", "fr-CH", "de-CH", "es", "pl", "pt-PT", "sv", "nb", "hr", "fi"]) {
    for (const n of [-12345.6, 12345.6, 1234.5, -1234.5, 0.5, 1e6]) {
      it(`${loc}: ${n}`, () => {
        const f = formatsFor(loc);
        const text = f.number(n, 1);
        expect(parseNumber(text, separatorsOf(f)), JSON.stringify(text)).toBe(n);
      });
    }
  }
  it("de-CH typed ASCII apostrophe is a group separator", () => {
    const s = separatorsOf(formatsFor("de-CH"));
    expect(filterInput("1'234.5", {}, s)).toBe("1'234.5");
    expect(parseNumber("1'234.5", s)).toBe(1234.5);
  });
  it("clamp rounds half away from zero for negatives", () => {
    expect(clampNumber(-2.5, { decimals: 0 })).toBe(-3);
    expect(clampNumber(1.005, { decimals: 2 })).toBe(1.01);
  });
  it("clamp survives many decimals", () => {
    expect(clampNumber(123456.789, { decimals: 320 })).toBe(123456.789);
  });
  it("step 0.1 thrice gives 0.3", () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="v" value={0.2} step={0.1} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(0.3);
  });
  it("es: focus + blur keeps 12345.6", () => {
    const onChange = vi.fn();
    render(<LanguageProvider formats={formatsFor("es")}><NumberInput aria-label="v" value={12345.6} onChange={onChange} /></LanguageProvider>);
    const f = screen.getByRole("textbox") as HTMLInputElement;
    const shown = f.value;
    fireEvent.focus(f); fireEvent.blur(f);
    expect(onChange, shown).not.toHaveBeenCalledWith(null);
  });
  it("tiny value is editable", () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="v" value={1e-11} onChange={onChange} />);
    const f = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(f, { target: { value: f.value + "5" } });
    expect(f.value).toBe("1E-115");
  });
});
