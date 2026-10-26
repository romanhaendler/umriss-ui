import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTableSelection } from "../src/model/useTableSelection";

describe("useTableSelection - set", () => {
  it("selects and clears several keys in one update, and keeps the others", () => {
    const { result } = renderHook(() => useTableSelection(["a", "b", "c", "d"]));
    act(() => result.current.toggle("d"));
    act(() => result.current.set(["a", "b"], true));
    expect([...result.current.selected].sort()).toEqual(["a", "b", "d"]);
    act(() => result.current.set(["b", "d"], false));
    expect([...result.current.selected]).toEqual(["a"]);
  });

  it("moves the keys in or out of except while all that match are selected", () => {
    const { result } = renderHook(() => useTableSelection(["a", "b", "c"]));
    act(() => result.current.selectMatching());
    act(() => result.current.set(["a", "b"], false));
    expect([...result.current.except].sort()).toEqual(["a", "b"]);
    expect(result.current.isSelected("a")).toBe(false);
    act(() => result.current.set(["a"], true));
    expect([...result.current.except]).toEqual(["b"]);
    expect(result.current.selected.size).toBe(0);
  });
});
