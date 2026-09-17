/* Row selection (table-model). The finest behaviour in the package, and until
   now asserted exclusively by the two red Playwright tests: Playwright cannot
   click the hidden checkbox, so the semantics were effectively unchecked. Here
   they go straight through the interface. */

import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTableSelection } from "../src/model/useTableSelection";

describe("useTableSelection – selection across pages", () => {
  it("begins empty", () => {
    const { result } = renderHook(() => useTableSelection(["a", "b", "c"]));
    expect(result.current.count).toBe(0);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.someSelected).toBe(false);
  });

  it("selects every key passed in – including those on later pages", () => {
    // The keys come from the filtered set, not from the page.
    const { result } = renderHook(() => useTableSelection(["a", "b", "c", "d", "e"]));
    act(() => result.current.toggleAll());
    expect(result.current.count).toBe(5);
    expect(result.current.allSelected).toBe(true);
  });

  it("reports a partial state as someSelected", () => {
    const { result } = renderHook(() => useTableSelection(["a", "b", "c"]));
    act(() => result.current.toggle("b"));
    expect(result.current.someSelected).toBe(true);
    expect(result.current.allSelected).toBe(false);
  });

  it("lifts a complete selection with the same grip", () => {
    const { result } = renderHook(() => useTableSelection(["a", "b"]));
    act(() => result.current.toggleAll());
    act(() => result.current.toggleAll());
    expect(result.current.count).toBe(0);
  });
});

describe("useTableSelection – a change of filter", () => {
  /* The real test: select something without a filter first, then filter and
     "select all". What lay outside the filter must stay. */
  it("keeps selections the filter no longer shows", () => {
    const { result, rerender } = renderHook(({ ids }) => useTableSelection(ids), {
      initialProps: { ids: ["a", "b", "c", "d"] },
    });

    act(() => result.current.toggle("d"));
    expect(result.current.count).toBe(1);

    // Now filtered: only a and b are visible.
    rerender({ ids: ["a", "b"] });
    act(() => result.current.toggleAll());

    // a and b added, d untouched.
    expect(result.current.count).toBe(3);
    expect(result.current.isSelected("d")).toBe(true);
    expect(result.current.allSelected).toBe(true);
  });

  /* Two reference sets in one object: allSelected counts the visible keys,
     count the whole accumulated selection. */
  it("tells 'every visible one selected' from 'how many altogether'", () => {
    const { result, rerender } = renderHook(({ ids }) => useTableSelection(ids), {
      initialProps: { ids: ["a", "b", "c"] },
    });
    act(() => result.current.toggleAll());
    expect(result.current.count).toBe(3);

    rerender({ ids: ["a"] });
    expect(result.current.allSelected).toBe(true);
    expect(result.current.count).toBe(3);
  });

  it("clears everything with clear, the invisible included", () => {
    const { result, rerender } = renderHook(({ ids }) => useTableSelection(ids), {
      initialProps: { ids: ["a", "b"] },
    });
    act(() => result.current.toggleAll());
    rerender({ ids: ["a"] });
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });

  it("works correctly even when the key list is created anew every time", () => {
    // The application usually passes filtered.map(...) through - a new list on
    // every render. That must not touch the semantics.
    const { result, rerender } = renderHook(({ n }) => useTableSelection(["a", "b"].slice(0, n)), {
      initialProps: { n: 2 },
    });
    act(() => result.current.toggleAll());
    rerender({ n: 2 });
    expect(result.current.count).toBe(2);
    expect(result.current.allSelected).toBe(true);
  });
});
