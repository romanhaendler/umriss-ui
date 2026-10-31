/* Form participation (ADR-0081): a field with `name` arrives in FormData as a native control would. */

import { describe, expect, it } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import {
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  LanguageProvider,
  MultiSelect,
  NumberInput,
} from "../src";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

const post = (field: React.ReactElement): [string, string][] => {
  const { container } = render(<form>{field}</form>);
  const data = new FormData(container.querySelector("form")!);
  return [...data.entries()].map(([k, v]) => [k, String(v)]);
};

// 2026-10-31 14:30 in Berlin is +01:00 (the clocks went back on the 25th).
const instant = new Date("2026-10-31T13:30:00Z");
const berlin = (node: React.ReactElement) => <LanguageProvider formats={{ timeZone: "Europe/Berlin" }}>{node}</LanguageProvider>;

describe("a field with a name posts its value", () => {
  it("Combobox posts the value, not the label", () => {
    expect(post(<Combobox name="c" options={OPTIONS} defaultValue="b" />)).toEqual([["c", "b"]]);
    expect(post(<Combobox name="c" options={OPTIONS} defaultValue="b" formValue={(v) => v.toUpperCase()} />)).toEqual([["c", "B"]]);
  });

  it("MultiSelect posts one entry per value", () => {
    expect(post(<MultiSelect name="m" options={OPTIONS} defaultValue={["a", "b"]} />)).toEqual([["m", "a"], ["m", "b"]]);
    expect(post(<MultiSelect name="m" options={OPTIONS} defaultValue={[]} />)).toEqual([["m", ""]]);
  });

  it("NumberInput posts the plain number", () => {
    expect(post(<NumberInput name="n" defaultValue={1234.5} />)).toEqual([["n", "1234.5"]]);
    expect(post(<NumberInput name="n" />)).toEqual([["n", ""]]);
  });

  it("DatePicker posts YYYY-MM-DD, DateTimePicker ISO with the offset", () => {
    expect(post(berlin(<DatePicker name="d" defaultValue={new Date(2026, 9, 31)} />))).toEqual([["d", "2026-10-31"]]);
    expect(post(berlin(<DateTimePicker name="t" defaultValue={instant} />))).toEqual([["t", "2026-10-31T14:30:00+01:00"]]);
    expect(post(<DatePicker name="d" />)).toEqual([["d", ""]]);
  });

  it("the range pickers post <name>Start and <name>End, both overridable", () => {
    const range = { from: instant, to: new Date("2026-11-02T13:30:00Z") };
    expect(post(berlin(<DateRangePicker name="r" defaultValue={range} />))).toEqual([["rStart", "2026-10-31"], ["rEnd", "2026-11-02"]]);
    expect(post(berlin(<DateTimeRangePicker name="r" defaultValue={range} />))).toEqual([
      ["rStart", "2026-10-31T14:30:00+01:00"],
      ["rEnd", "2026-11-02T14:30:00+01:00"],
    ]);
    expect(post(<DateRangePicker name="r" startName="from" endName="to" />)).toEqual([["from", ""], ["to", ""]]);
  });

  it("formValue replaces the default format; a field without a name or a disabled one posts nothing", () => {
    expect(post(<NumberInput name="n" defaultValue={2} formValue={(v) => `#${v}`} />)).toEqual([["n", "#2"]]);
    expect(post(<Combobox options={OPTIONS} defaultValue="a" />)).toEqual([]);
    expect(post(<Combobox name="c" options={OPTIONS} defaultValue="a" disabled />)).toEqual([]);
  });

  it("reaches a React 19 form action", async () => {
    let seen: [string, string][] = [];
    const { container } = render(
      <form action={(data) => { seen = [...data.entries()].map(([k, v]) => [k, String(v)]); }}>
        <Combobox name="c" options={OPTIONS} defaultValue="a" />
        <DateRangePicker name="r" defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 3) }} />
      </form>,
    );
    await act(async () => { fireEvent.submit(container.querySelector("form")!); });
    expect(seen).toEqual([["c", "a"], ["rStart", "2026-10-01"], ["rEnd", "2026-10-03"]]);
  });
});
