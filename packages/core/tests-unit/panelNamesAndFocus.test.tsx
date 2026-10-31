/* The MultiSelect's panel and the date pickers' dialogs are named after their field; the panel's
   buttons keep the focus where it was and say what they did. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";
import { DatePicker } from "../src/components/DatePicker";
import { FormField } from "../src/components/FormField";
import * as announcer from "../src/lib/announce";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Field() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <FormField label="Cities">
      <MultiSelect options={OPTIONS} value={value} onValueChange={setValue} searchPlaceholder="Find" />
    </FormField>
  );
}

const openPanel = () => {
  const trigger = screen.getByRole("button", { name: "Cities" });
  fireEvent.click(trigger);
};

describe("names", () => {
  it("names the MultiSelect panel after the field's label, not the placeholder", () => {
    render(<Field />);
    openPanel();
    expect(screen.getByRole("dialog", { name: "Cities" })).toBeTruthy();
  });

  it("names the MultiSelect panel after the aria-label without a FormField", () => {
    render(<MultiSelect options={OPTIONS} value={[]} onValueChange={() => {}} aria-label="Cities" />);
    fireEvent.click(screen.getByRole("button", { name: "Cities" }));
    expect(screen.getByRole("dialog", { name: "Cities" })).toBeTruthy();
  });

  it("names the DatePicker dialog after the field", () => {
    render(
      <FormField label="Due date">
        <DatePicker />
      </FormField>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Due date" }));
    expect(screen.getByRole("dialog", { name: "Due date" })).toBeTruthy();
  });

  it("gives the scope button and the bulk button different names", () => {
    render(<Field />);
    openPanel();
    expect(screen.getByRole("button", { name: "View all" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
  });
});

describe("the panel's buttons", () => {
  it("keep the focus on the search and announce the count", () => {
    const say = vi.spyOn(announcer, "announce");
    render(<Field />);
    openPanel();
    const search = screen.getByPlaceholderText("Find");
    expect(document.activeElement).toBe(search);

    // A press on the button does not move the focus off the search.
    const all = screen.getByRole("button", { name: "All" });
    expect(fireEvent.mouseDown(all)).toBe(false);
    fireEvent.click(all);
    expect(say).toHaveBeenLastCalledWith("3 selected", expect.anything());

    const scope = screen.getByRole("button", { name: /^Selected/ });
    expect(fireEvent.mouseDown(scope)).toBe(false);
    fireEvent.click(scope);
    expect(document.activeElement).toBe(search);
  });
});
