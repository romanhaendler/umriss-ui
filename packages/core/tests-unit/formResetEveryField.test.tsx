/* A form's reset restores every uncontrolled field to its defaultValue, reports it, and leaves the
   shown value and the posted one in step; a controlled field only tells its owner. */

import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  MultiSelect,
  NumberInput,
  RadioGroup,
  SegmentedControl,
  Textarea,
} from "../src";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const day = new Date(2026, 5, 10);
const range = { from: new Date(2026, 5, 10), to: new Date(2026, 5, 12) };
const clear = () => {
  fireEvent.click(screen.getAllByRole("button")[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
};
const posted = () => (document.querySelector('input[name="f"]') as HTMLInputElement | null)?.value ?? "";
const radioShown = () => (screen.getByRole("radio", { name: "Alpha" }) as HTMLInputElement).checked;

// Each field types its own value; the table hands them all the same two props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Given = any;

interface Case {
  name: string;
  make: (p: Given) => ReactElement;
  change: () => void;
  /** What the field shows and posts: must be equal before the change and after the reset. */
  state: () => unknown;
  expected: unknown;
}

const cases: Case[] = [
  {
    name: "NumberInput",
    make: (p) => <NumberInput aria-label="f" name="f" defaultValue={5} {...p} />,
    change: () => fireEvent.change(screen.getByRole("textbox"), { target: { value: "9" } }),
    state: () => [(screen.getByRole("textbox") as HTMLInputElement).value, posted()],
    expected: 5,
  },
  {
    name: "Combobox",
    make: (p) => <Combobox aria-label="f" name="f" options={OPTIONS} defaultValue="a" {...p} />,
    change: () => {
      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    },
    state: () => [(screen.getByRole("combobox") as HTMLInputElement).value, posted()],
    expected: "a",
  },
  {
    name: "MultiSelect",
    make: (p) => <MultiSelect aria-label="f" name="f" options={OPTIONS} clearable defaultValue={["a"]} {...p} />,
    change: () => fireEvent.click(screen.getByRole("button", { name: "Clear selection" })),
    state: () => [document.body.textContent, posted()],
    expected: ["a"],
  },
  {
    name: "RadioGroup",
    make: (p) => <RadioGroup aria-label="f" name="f" options={OPTIONS} defaultValue="a" {...p} />,
    change: () => fireEvent.click(screen.getByRole("radio", { name: "Beta" })),
    state: radioShown,
    expected: "a",
  },
  {
    name: "SegmentedControl",
    make: (p) => <SegmentedControl aria-label="f" name="f" options={OPTIONS} defaultValue="a" {...p} />,
    change: () => fireEvent.click(screen.getByRole("radio", { name: "Beta" })),
    state: radioShown,
    expected: "a",
  },
  {
    name: "DatePicker",
    make: (p) => <DatePicker aria-label="f" name="f" clearable defaultValue={day} {...p} />,
    change: clear,
    state: () => [document.body.textContent, posted()],
    expected: day,
  },
  {
    name: "DateTimePicker",
    make: (p) => <DateTimePicker aria-label="f" name="f" clearable defaultValue={day} {...p} />,
    change: clear,
    state: () => [document.body.textContent, posted()],
    expected: day,
  },
  {
    name: "DateRangePicker",
    make: (p) => <DateRangePicker aria-label="f" name="f" clearable defaultValue={range} {...p} />,
    change: clear,
    state: () => [document.body.textContent, posted()],
    expected: range,
  },
  {
    name: "DateTimeRangePicker",
    make: (p) => <DateTimeRangePicker aria-label="f" name="f" clearable presets={[]} defaultValue={range} {...p} />,
    change: clear,
    state: () => [document.body.textContent, posted()],
    expected: range,
  },
];

const reset = (container: HTMLElement) =>
  act(() => {
    container.querySelector("form")!.reset();
  });

describe.each(cases)("$name in a form that resets", (c) => {
  it("returns to its defaultValue and reports it", () => {
    const onValueChange = vi.fn();
    const { container } = render(<form>{c.make({ onValueChange })}</form>);
    const before = c.state();
    c.change();
    expect(c.state()).not.toEqual(before);
    onValueChange.mockClear();
    reset(container);
    expect(c.state()).toEqual(before);
    expect(onValueChange).toHaveBeenLastCalledWith(c.expected);
  });

  it("tells a controlled field's owner the default", () => {
    const onValueChange = vi.fn();
    const { container } = render(<form>{c.make({ onValueChange, value: null })}</form>);
    reset(container);
    expect(onValueChange).toHaveBeenLastCalledWith(c.expected);
  });
});

describe("Textarea in a form that resets", () => {
  it("counts its default again", () => {
    const { container } = render(
      <form>
        <Textarea aria-label="f" defaultValue="abc" maxLength={10} showCount />
      </form>,
    );
    fireEvent.input(screen.getByRole("textbox"), { target: { value: "abcdef" } });
    expect(container.textContent).toContain("4");
    reset(container);
    expect(container.textContent).toContain("7");
  });
});
