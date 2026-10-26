/* A list of more than 500 options is drawn through a window; a shorter one,
   and a grouped one, whole. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";
import { Select } from "../src/components/Select";

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ value: `v${i + 1}`, label: `Centre ${i + 1}` }));

function Field({ n, onChange }: { n: number; onChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox
      options={make(n)}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      aria-label="Centre"
    />
  );
}

const press = (element: Element) => {
  fireEvent.pointerDown(element, { pointerType: "mouse", button: 0 });
  fireEvent.mouseDown(element, { button: 0 });
};

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 32 } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

describe("Combobox - a long list", () => {
  it("opens with a window of the options, and End reaches the last", () => {
    render(<Field n={10000} />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(screen.getAllByRole("option").length).toBeLessThan(100);

    fireEvent.keyDown(input, { key: "End" });
    const last = screen.getByRole("option", { name: "Centre 10000" });
    expect(last.getAttribute("aria-posinset")).toBe("10000");
    expect(last.getAttribute("aria-setsize")).toBe("10000");
    expect(input.getAttribute("aria-activedescendant")).toBe(last.id);
    expect(screen.getAllByRole("option").length).toBeLessThan(100);
  });

  it("filters while typing and chooses the active option on Enter", () => {
    const onChange = vi.fn();
    render(<Field n={10000} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "Centre 7" } });
    expect(screen.getAllByRole("option").length).toBeLessThan(100);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("v7");
  });

  it("draws all 500 options of a short list, without positions", () => {
    render(<Field n={500} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(500);
    expect(screen.getAllByRole("option")[0]!.hasAttribute("aria-posinset")).toBe(false);
  });
});

describe("Select - its own list", () => {
  it("windows a flat list of thousands and draws a grouped one whole", () => {
    const { unmount } = render(
      <Select aria-label="Centre" defaultValue="">
        {/* jsdom reads native options in quadratic time, so 2,000 stand for 10,000 here. */}
        {make(2000).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>,
    );
    press(screen.getByRole("combobox"));
    expect(within(screen.getByRole("listbox")).getAllByRole("option").length).toBeLessThan(100);
    unmount();

    render(
      <Select aria-label="Centre" defaultValue="">
        <optgroup label="All">
          {make(1000).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      </Select>,
    );
    press(screen.getByRole("combobox"));
    expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1000);
  }, 60000);
});
