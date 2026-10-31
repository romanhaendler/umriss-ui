/* A creatable Combobox takes typed text as its value: an `Add "…"` row, or
   Enter on text that fits no option. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

const type = (input: HTMLElement, text: string) => {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
};

describe("Combobox - creatable", () => {
  it("offers an Add row for text that fits no label, and Enter chooses it", () => {
    const onValueChange = vi.fn();
    const onCreate = vi.fn();
    render(<Combobox creatable options={OPTIONS} value={null} onValueChange={onValueChange} onCreate={onCreate} aria-label="Tag" />);
    const input = screen.getByRole("combobox");
    type(input, "Delta");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(['Add "Delta"']);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("Delta");
    expect(onCreate).toHaveBeenCalledWith("Delta");
  });

  it("shows the row below partial matches, and not for an exact label", () => {
    render(<Combobox creatable options={OPTIONS} value={null} onValueChange={vi.fn()} aria-label="Tag" />);
    const input = screen.getByRole("combobox");
    type(input, "al");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Alpha", 'Add "al"']);
    type(input, "alpha");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Alpha"]);
  });

  it("keeps the created text in the field and posts it", () => {
    const { container } = render(<Combobox creatable name="tag" options={OPTIONS} defaultValue={null} aria-label="Tag" />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    type(input, "Delta");
    fireEvent.click(screen.getByRole("option"));
    expect(input.value).toBe("Delta");
    expect((container.querySelector('[name="tag"]') as HTMLInputElement).value).toBe("Delta");
  });

  it("offers nothing without creatable", () => {
    render(<Combobox options={OPTIONS} value={null} onValueChange={vi.fn()} aria-label="Tag" />);
    type(screen.getByRole("combobox"), "Delta");
    expect(screen.queryAllByRole("option")).toEqual([]);
  });
});
