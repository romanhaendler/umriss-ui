/* A wrong shape on a field warns once per instance in development - the
   component, the prop and the shape expected - and renders as empty. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Combobox, DatePicker, DateRangePicker, DateTimePicker, MultiSelect, NumberInput, Stat } from "../src";

const noop = () => {};
const bad = (v: unknown) => v as never;

afterEach(() => vi.restoreAllMocks());

function warnings(ui: React.ReactElement, rerenderTo?: React.ReactElement): string[] {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { rerender } = render(ui);
  if (rerenderTo) rerender(rerenderTo);
  return warn.mock.calls.map((c) => String(c[0]));
}

const cases: [string, React.ReactElement, RegExp][] = [
  ["DatePicker", <DatePicker value={bad("2024-03-04")} onChange={noop} aria-label="d" />, /DatePicker value must be a Date or null/],
  ["DateTimePicker", <DateTimePicker value={bad("2024-03-04")} onChange={noop} aria-label="d" />, /DateTimePicker value must be a Date or null/],
  ["DateRangePicker", <DateRangePicker value={bad("2024-03-04")} onChange={noop} aria-label="d" />, /DateRangePicker value must be \{ from: Date, to: Date \} or null/],
  ["MultiSelect value", <MultiSelect options={[{ value: "a", label: "A" }]} value={bad("a")} onChange={noop} aria-label="m" />, /MultiSelect value must be an array/],
  ["MultiSelect options", <MultiSelect options={bad(["a", "b"])} value={[]} onChange={noop} aria-label="m" />, /MultiSelect options must be an array of \{ value, label \}/],
  ["Combobox options", <Combobox options={bad(["a", "b"])} value={null} onChange={noop} aria-label="c" />, /Combobox options must be an array of \{ value, label \}/],
  ["NumberInput", <NumberInput value={bad("12")} onChange={noop} aria-label="n" />, /NumberInput value must be a number or null/],
  ["Stat", <Stat label="L" value={bad("3.42")} />, /Stat value must be a number, null or undefined/],
];

describe("shape warnings", () => {
  it.each(cases)("%s warns once and does not throw", (_n, ui, re) => {
    const w = warnings(ui, ui);
    expect(w.filter((m) => re.test(m))).toHaveLength(1);
  });

  it("stays quiet for the right shapes", () => {
    const w = warnings(
      <>
        <DatePicker value={new Date()} onChange={noop} aria-label="d" />
        <DatePicker value={null} onChange={noop} aria-label="d" />
        <MultiSelect options={[{ value: "a", label: "A" }]} value={["a"]} onChange={noop} aria-label="m" />
        <Combobox options={[{ value: "a", label: "A" }]} value={null} onChange={noop} aria-label="c" />
        <NumberInput value={null} onChange={noop} aria-label="n" />
        <Stat label="L" value={null} />
      </>,
    );
    expect(w).toEqual([]);
  });
});
