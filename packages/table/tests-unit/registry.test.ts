/* The registry (umriss-table 02, 06): what a new function on a column triggers
   and what it does not. The case at stake: a children function that comes into
   being on every render must not make the model recalculate - it sorts and
   filters nothing. */

import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS } from "@umriss-ui/core";
import { Registry } from "../src/registry";
import type { ColumnSpec } from "../src/registry";

const rows = [{ amount: 2 }, { amount: 1 }];

const spec = (more: Partial<ColumnSpec> = {}): ColumnSpec => ({
  id: "quantity",
  label: "Quantity",
  value: "amount",
  rowHeader: false,
  resizable: false,
  ...more,
});

describe("Registry", () => {
  it("the same spec twice changes no version", () => {
    const registry = new Registry();
    registry.registerColumn("s1", spec());
    const before = registry.bodyVersion();
    registry.registerColumn("s1", spec());
    expect(registry.bodyVersion()).toBe(before);
  });

  it("a new presentation leaves the model's columns as they are", () => {
    const registry = new Registry();
    registry.registerColumn("s1", spec({ presentation: () => "a" }));
    const columns = registry.modelColumns(rows, DEFAULT_FORMATS);
    const structureBefore = registry.structureVersion();
    registry.registerColumn("s1", spec({ presentation: () => "b" }));
    expect(registry.modelColumns(rows, DEFAULT_FORMATS)).toBe(columns);
    expect(registry.structureVersion()).toBe(structureBefore);
  });

  it("a new value function rebuilds them", () => {
    const registry = new Registry();
    registry.registerColumn("s1", spec({ id: "doppelt", value: (z: { amount: number }) => z.amount * 2 }));
    const columns = registry.modelColumns(rows, DEFAULT_FORMATS);
    registry.registerColumn("s1", spec({ id: "doppelt", value: (z: { amount: number }) => z.amount * 3 }));
    expect(registry.modelColumns(rows, DEFAULT_FORMATS)).not.toBe(columns);
  });

  it("a new label is structure - the hook re-renders for it", () => {
    const registry = new Registry();
    registry.registerColumn("s1", spec());
    const before = registry.structureVersion();
    registry.registerColumn("s1", spec({ label: "Piece" }));
    expect(registry.structureVersion()).toBeGreaterThan(before);
  });
});
