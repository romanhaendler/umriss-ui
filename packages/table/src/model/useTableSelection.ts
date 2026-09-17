import { useCallback, useMemo, useState } from "react";

export interface TableSelection<T extends string | number> {
  /** The keys currently selected. */
  selected: ReadonlySet<T>;
  isSelected: (id: T) => boolean;
  toggle: (id: T) => void;
  /** Selects all the keys passed in, or clears the selection. */
  toggleAll: () => void;
  clear: () => void;
  /** true when every currently visible key is selected. */
  allSelected: boolean;
  /** true when some - but not all - are selected. */
  someSelected: boolean;
  count: number;
}

/**
 * A small headless helper for row selection: it holds the selection as a set
 * and supplies the states for "select all" (including indeterminate).
 * What the selection means in the domain stays the application's business.
 */
export function useTableSelection<T extends string | number>(ids: readonly T[]): TableSelection<T> {
  const [selected, setSelected] = useState<ReadonlySet<T>>(new Set());

  const isSelected = useCallback((id: T) => selected.has(id), [selected]);

  const toggle = useCallback((id: T) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allSelected = useMemo(
    () => ids.length > 0 && ids.every((id) => selected.has(id)),
    [ids, selected],
  );

  const someSelected = useMemo(
    () => !allSelected && ids.some((id) => selected.has(id)),
    [ids, selected, allSelected],
  );

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      const next = new Set(current);
      const everySelected = ids.length > 0 && ids.every((id) => next.has(id));
      if (everySelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [ids]);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, isSelected, toggle, toggleAll, clear, allSelected, someSelected, count: selected.size };
}
