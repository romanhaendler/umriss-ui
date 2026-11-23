/* The cross of a `clearable` field clears it - controlled or not - and
   reports the empty value once; `onClear` alone still works and warns. */

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input, Select, TreeSearch, useTree } from "../src";

afterEach(() => vi.restoreAllMocks());

const cross = (name: RegExp) => screen.getByRole("button", { name, hidden: true });

describe("Input clearable", () => {
  it("controlled: one onValueChange with the empty text per click", () => {
    const onValueChange = vi.fn();
    render(<Input aria-label="Search" clearable value="abc" onValueChange={onValueChange} />);
    fireEvent.click(cross(/clear/i));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("uncontrolled: empties the field, reports once, and the cross goes", () => {
    const onValueChange = vi.fn();
    render(<Input aria-label="Search" clearable defaultValue="abc" onValueChange={onValueChange} />);
    fireEvent.click(cross(/clear/i));
    expect((screen.getByLabelText("Search") as HTMLInputElement).value).toBe("");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(screen.queryByRole("button", { name: /clear/i, hidden: true })).toBeNull();
  });

  it("uncontrolled without any callback: the cross shows after typing and clears", () => {
    render(<Input aria-label="Search" clearable />);
    expect(screen.queryByRole("button", { name: /clear/i, hidden: true })).toBeNull();
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "x" } });
    fireEvent.click(cross(/clear/i));
    expect((screen.getByLabelText("Search") as HTMLInputElement).value).toBe("");
  });

  it("onClear alone: still called, and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const onClear = vi.fn();
    render(<Input aria-label="Search" clearable value="abc" onChange={() => undefined} onClear={onClear} />);
    fireEvent.click(cross(/clear/i));
    fireEvent.click(cross(/clear/i));
    expect(onClear).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.filter(([message]) => String(message).includes("Input onClear"))).toHaveLength(1);
  });
});

describe("Select clearable", () => {
  const options = [
    <option key="" value="">
      None
    </option>,
    <option key="a" value="a">
      A
    </option>,
  ];

  it("controlled: one onValueChange with null per click", () => {
    const onValueChange = vi.fn();
    render(
      <Select aria-label="Owner" clearable value="a" onValueChange={onValueChange}>
        {options}
      </Select>,
    );
    fireEvent.click(cross(/clear/i));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("uncontrolled: empties the choice, reports once, and the cross goes", () => {
    const onValueChange = vi.fn();
    render(
      <Select aria-label="Owner" clearable defaultValue="a" onValueChange={onValueChange}>
        {options}
      </Select>,
    );
    fireEvent.click(cross(/clear/i));
    expect((screen.getByLabelText("Owner") as HTMLSelectElement).value).toBe("");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /clear/i, hidden: true })).toBeNull();
  });

  it("onClear alone: still called, and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const onClear = vi.fn();
    render(
      <Select aria-label="Owner" clearable value="a" onChange={() => undefined} onClear={onClear}>
        {options}
      </Select>,
    );
    fireEvent.click(cross(/clear/i));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls.filter(([message]) => String(message).includes("Select onClear"))).toHaveLength(1);
  });
});

describe("TreeSearch clearable", () => {
  it("clears the tree's search text", () => {
    function Harness() {
      const tree = useTree([], { reader: { key: (n: { id: string }) => n.id, children: () => [], label: (n: { id: string }) => n.id } });
      const [seen, setSeen] = useState("");
      return (
        <>
          <TreeSearch tree={tree} aria-label="Find" clearable onValueChange={setSeen} />
          <output>{seen}</output>
        </>
      );
    }
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Find"), { target: { value: "ab" } });
    fireEvent.click(cross(/clear/i));
    expect((screen.getByLabelText("Find") as HTMLInputElement).value).toBe("");
  });
});
