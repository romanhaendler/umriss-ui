/* The choice fields take numbers as values: the value comes back with its
   type, and a form gets its text. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";
import { MultiSelect } from "../src/components/MultiSelect";
import { RadioGroup } from "../src/components/RadioGroup";
import { SegmentedControl } from "../src/components/SegmentedControl";
import { Select } from "../src/components/Select";

const OPTIONS = [
  { value: 1, label: "One" },
  { value: 2, label: "Two" },
  { value: 3, label: "Three" },
];

describe("numeric option values", () => {
  it("SegmentedControl and RadioGroup report the number", () => {
    const segmented = vi.fn<(value: number | null) => void>();
    const group = vi.fn<(value: number | null) => void>();
    render(
      <>
        <SegmentedControl aria-label="Segments" options={OPTIONS} defaultValue={1} onValueChange={segmented} />
        <RadioGroup aria-label="Radios" options={OPTIONS} defaultValue={1} onValueChange={group} />
      </>,
    );
    fireEvent.click(screen.getAllByRole("radio", { name: "Two" })[0]!);
    fireEvent.click(screen.getAllByRole("radio", { name: "Three" })[1]!);
    expect(segmented).toHaveBeenLastCalledWith(2);
    expect(group).toHaveBeenLastCalledWith(3);
  });

  it("a controlled SegmentedControl checks the number", () => {
    render(<SegmentedControl aria-label="Segments" options={OPTIONS} value={2} onValueChange={() => undefined} />);
    expect((screen.getByRole("radio", { name: "Two" }) as HTMLInputElement).checked).toBe(true);
  });

  it("Combobox reports the number", () => {
    const onValueChange = vi.fn<(value: number | null) => void>();
    render(<Combobox aria-label="Pump" options={OPTIONS} value={null} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Pump" }));
    fireEvent.click(screen.getByRole("option", { name: "Two" }));
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it("MultiSelect posts one text per number", () => {
    const { container } = render(
      <form>
        <MultiSelect aria-label="Pumps" name="pumps" options={OPTIONS} value={[1, 3]} onValueChange={() => undefined} />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).getAll("pumps")).toEqual(["1", "3"]);
  });

  it("Select hands back a number for an option written with one", () => {
    const onValueChange = vi.fn<(value: number | null) => void>();
    render(
      <Select aria-label="Pump" value={1} onValueChange={onValueChange}>
        <option value={1}>One</option>
        <option value={2}>Two</option>
      </Select>,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Pump" }), { target: { value: "2" } });
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });
});
