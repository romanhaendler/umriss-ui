// @vitest-environment jsdom

/* The layout part keeps its old value when a new snapshot changes nothing in it. */

import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLayoutPart } from "../src/useLayoutPart";
import type { ChartScene } from "../src/scene";
import type { LayoutSnapshot } from "../src/sceneModel";

function fake(first: object) {
  let snapshot = first as LayoutSnapshot;
  const listeners = new Set<() => void>();
  const scene = {
    subscribeLayout: (l: () => void) => (listeners.add(l), () => listeners.delete(l)),
    getLayoutSnapshot: () => snapshot,
    getLayoutServerSnapshot: () => snapshot,
  } as unknown as ChartScene;
  return {
    scene,
    set(next: object) {
      snapshot = next as LayoutSnapshot;
      act(() => listeners.forEach((l) => l()));
    },
  };
}

describe("useLayoutPart", () => {
  it("hands back the old part when an equal one is selected", () => {
    const f = fake({ a: { n: 1 } });
    const { result } = renderHook(() => useLayoutPart(f.scene, (s) => (s as unknown as { a: object }).a));
    const first = result.current;
    f.set({ a: { n: 1 } });
    expect(result.current).toBe(first);
  });

  it("compares a typed array by identity, not by walking it", () => {
    const f = fake({ a: { v: new Float64Array([1, 2]) } });
    const { result } = renderHook(() => useLayoutPart(f.scene, (s) => (s as unknown as { a: object }).a));
    const first = result.current;
    f.set({ a: { v: new Float64Array([1, 2]) } });
    expect(result.current).not.toBe(first);
  });

  it("takes the snapshot itself without comparing", () => {
    const f = fake({ a: 1 });
    const { result } = renderHook(() => useLayoutPart(f.scene, (s) => s));
    const next = { a: 1 };
    f.set(next);
    expect(result.current).toBe(next);
  });
});
