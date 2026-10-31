/* The MultiSelect's options are a multiselectable listbox of options with one Tab stop and roving focus. */

import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

const OPTIONS = [
  { value: "a", label: "Alpha", disabled: true },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

afterEach(cleanup);

function Field() {
  const [value, setValue] = useState<string[]>([]);
  return <MultiSelect options={OPTIONS} value={value} onValueChange={setValue} aria-label="Letters" searchPlaceholder="Find" />;
}

const open = () => fireEvent.click(screen.getByRole("button", { name: "Letters" }));

describe("MultiSelect - options", () => {
  it("is a multiselectable listbox of options with aria-selected", () => {
    render(<Field />);
    open();
    expect(screen.getByRole("listbox").getAttribute("aria-multiselectable")).toBe("true");
    expect(screen.getAllByRole("option").map((o) => o.getAttribute("aria-selected"))).toEqual(["false", "false", "false"]);
  });

  it("has one Tab stop, which roves; Space and Enter toggle", () => {
    render(<Field />);
    open();
    const stops = () => screen.getAllByRole("option").filter((o) => o.tabIndex === 0).map((o) => o.textContent);
    expect(stops()).toEqual(["Beta"]);
    fireEvent.keyDown(screen.getByPlaceholderText("Find"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Beta" }));
    fireEvent.keyDown(document.activeElement!, { key: " " });
    expect(screen.getByRole("option", { name: "Beta" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Gamma" }));
    expect(stops()).toEqual(["Gamma"]);
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    expect(screen.getByRole("option", { name: "Gamma" }).getAttribute("aria-selected")).toBe("true");
  });

  it("does not toggle a disabled option", () => {
    render(<Field />);
    open();
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
    expect(screen.getByRole("option", { name: "Alpha" }).getAttribute("aria-selected")).toBe("false");
  });
});
