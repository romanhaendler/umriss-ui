/* `clearable` on the multiselect, as on Select and Combobox: one cross that
   empties the whole selection - and only the selection, the panel stays shut. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("MultiSelect - clearable", () => {
  it("empties the whole selection without opening the panel", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} value={["a", "b"]} onChange={onChange} aria-label="Letters" clearable />);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { expanded: false })).toBe(document.activeElement);
  });

  it("stands only with a selection, and only when asked for", () => {
    const { rerender } = render(
      <MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} aria-label="Letters" clearable />,
    );
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
    rerender(<MultiSelect options={OPTIONS} value={["a"]} onChange={vi.fn()} aria-label="Letters" />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
  });

  /* A disabled option means "do not change": the cross keeps its chosen
     value, as "Select none" does, and does not stand for it alone. */
  it("keeps a chosen value whose option is disabled", () => {
    const options = [...OPTIONS, { value: "c", label: "Gamma", disabled: true }];
    const onChange = vi.fn();
    const { rerender } = render(
      <MultiSelect options={options} value={["a", "c"]} onChange={onChange} aria-label="Letters" clearable />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenCalledWith(["c"]);
    rerender(<MultiSelect options={options} value={["c"]} onChange={onChange} aria-label="Letters" clearable />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
  });

  it("is not there on a disabled field", () => {
    render(<MultiSelect options={OPTIONS} value={["a"]} onChange={vi.fn()} aria-label="Letters" clearable disabled />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).toBeNull();
  });
});
