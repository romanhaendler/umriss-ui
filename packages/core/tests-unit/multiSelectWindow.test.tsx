/* A MultiSelect of more than 500 options draws only the checkboxes in view;
   the keys and the bulk actions still reach every option. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ value: `v${i + 1}`, label: `Asset ${i + 1}` }));

function Field({ n, disabledFirst = 0, onChange }: { n: number; disabledFirst?: number; onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  const options = make(n).map((option, i) => ({ ...option, disabled: i < disabledFirst }));
  return (
    <MultiSelect
      options={options}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      aria-label="Assets"
      searchPlaceholder="Find"
    />
  );
}

const trigger = () => screen.getByRole("button", { name: "Assets" });
const open = (pointerType = "mouse") => {
  trigger().focus();
  fireEvent.pointerDown(trigger(), { pointerType, button: 0 });
  fireEvent.click(trigger());
};
const search = () => screen.getByPlaceholderText("Find");

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 36 } as DOMRect);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MultiSelect - a long list", () => {
  it("opens with a window of the checkboxes, and End and Home reach the ends", () => {
    render(<Field n={10000} />);
    open();
    expect(screen.getAllByRole("checkbox").length).toBeLessThan(100);

    fireEvent.keyDown(search(), { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Asset 1" }));

    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Asset 10000" }));
    expect(screen.getAllByRole("checkbox").length).toBeLessThan(100);

    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Asset 1" }));
  });

  it("returns to the search on ArrowUp from the first option", () => {
    render(<Field n={10000} />);
    open();
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(search());
  });

  it("ticks every match of the search on Select all, drawn or not", () => {
    const onChange = vi.fn();
    render(<Field n={10000} onChange={onChange} />);
    open();
    fireEvent.change(search(), { target: { value: "Asset 7" } });
    fireEvent.click(screen.getAllByRole("button", { name: "All" }).at(-1)!);
    const chosen = onChange.mock.calls.at(-1)![0] as string[];
    expect(chosen).toHaveLength(make(10000).filter((o) => o.label.includes("Asset 7")).length);
    expect(chosen).toContain("v7000");
  });

  it("focuses the first enabled option when a touch opens it", () => {
    render(<Field n={10000} disabledFirst={3} />);
    open("touch");
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Asset 4" }));
  });

  it("draws all 500 options", () => {
    render(<Field n={500} />);
    open();
    expect(screen.getAllByRole("checkbox")).toHaveLength(500);
  });
});
