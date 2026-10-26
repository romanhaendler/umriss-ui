/* A Combobox that searches with the application: it reports what is typed,
   shows the options as given, says "Loading", and keeps the chosen label. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";
import { ANNOUNCE_REST } from "../src/lib/announce";

const ROWS = [
  { value: "a", label: "Acme" },
  { value: "z", label: "Zeta" },
];

const heard = () => {
  act(() => {
    vi.advanceTimersByTime(ANNOUNCE_REST);
  });
  const region = Array.from(document.body.children).find((c) => c.hasAttribute("data-umriss-announcer"));
  return region?.textContent ?? null;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll("[data-umriss-announcer]").forEach((r) => r.remove());
  vi.restoreAllMocks();
});

describe("Combobox - onSearch", () => {
  it("reports each typed text and the clearing cross's empty one", () => {
    const onSearch = vi.fn();
    render(<Combobox options={ROWS} value="a" onChange={vi.fn()} onSearch={onSearch} clearable aria-label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ac" } });
    expect(onSearch.mock.calls).toEqual([["a"], ["ac"]]);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSearch).toHaveBeenLastCalledWith("");
  });
});

describe("Combobox - filter={false}", () => {
  it("shows and lets choose an option that does not contain the text", () => {
    const onChange = vi.fn();
    render(<Combobox options={ROWS} value={null} onChange={onChange} filter={false} aria-label="Customer" />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ac" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Acme", "Zeta"]);
    fireEvent.click(screen.getByRole("option", { name: "Zeta" }));
    expect(onChange).toHaveBeenCalledWith("z");
  });

  it("announces the count when the options arrive, not at the keystroke", () => {
    const props = { value: null, onChange: vi.fn(), filter: false, "aria-label": "Customer" } as const;
    const { rerender } = render(<Combobox options={ROWS} {...props} />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(heard()).toBe("2 options");
    fireEvent.change(input, { target: { value: "ac" } });
    expect(heard()).toBe("2 options"); // unchanged: nothing new was said at the keystroke
    document.querySelectorAll("[data-umriss-announcer]").forEach((r) => (r.textContent = ""));
    fireEvent.change(input, { target: { value: "acm" } });
    expect(heard()).toBe("");
    rerender(<Combobox options={ROWS.slice(0, 1)} {...props} />);
    expect(heard()).toBe("1 option");
    rerender(<Combobox options={[]} {...props} />);
    expect(heard()).toBe("No matches");
  });

  it("resets the active option to the first when the options change", () => {
    const props = { value: null, onChange: vi.fn(), filter: false, "aria-label": "Customer" } as const;
    const { rerender } = render(<Combobox options={ROWS} {...props} />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-1$/);
    rerender(<Combobox options={[{ value: "q", label: "Qux" }, ...ROWS]} {...props} />);
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-0$/);
  });
});

describe("Combobox - loading", () => {
  it("shows Loading where the empty text would stand and marks the list busy", () => {
    render(<Combobox options={[]} value={null} onChange={vi.fn()} loading aria-label="Customer" />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Loading")).toBeTruthy();
    expect(screen.queryByText("No matches")).toBeNull();
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
  });

  it("keeps given options above the line", () => {
    render(<Combobox options={ROWS} value={null} onChange={vi.fn()} loading aria-label="Customer" />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText("Loading")).toBeTruthy();
  });
});

describe("Combobox - the chosen label", () => {
  it("stays in the field after a search replaced the options", () => {
    function App() {
      const [value, setValue] = useState<string | null>(null);
      const [options, setOptions] = useState(ROWS);
      return (
        <>
          <Combobox options={options} value={value} onChange={setValue} filter={false} aria-label="Customer" />
          <button onClick={() => setOptions([{ value: "q", label: "Qux" }])}>replace</button>
        </>
      );
    }
    render(<App />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("option", { name: "Zeta" }));
    expect(input.value).toBe("Zeta");
    fireEvent.click(screen.getByText("replace"));
    expect(input.value).toBe("Zeta");
  });
});

describe("Combobox - a server's 5,000 matches", () => {
  it("are windowed", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 32 } as DOMRect);
    const many = Array.from({ length: 5000 }, (_, i) => ({ value: `v${i}`, label: `Customer ${i}` }));
    render(<Combobox options={many} value={null} onChange={vi.fn()} filter={false} aria-label="Customer" />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option").length).toBeLessThan(100);
  });
});
