import { useCallback, useMemo, useState } from "react";

/** What `useTableSelection` returns: the selected keys and the gestures on
    them. Give it to `useTable` as `selection` when the application holds the
    selection. */
export interface TableSelection<T extends string | number> {
  /** The keys currently selected. */
  selected: ReadonlySet<T>;
  isSelected: (id: T) => boolean;
  toggle: (id: T) => void;
  /** Gives every key in `ids` the state `selected`, in one update; keys
      outside `ids` stay as they are. While `allMatching` it moves the keys in
      or out of `except` instead. The table calls it for a range of rows. */
  set: (ids: readonly T[], selected: boolean) => void;
  /** Selects all the keys passed in - or, when all of them are selected
      already, deselects them. Keys outside them stay as they are. */
  toggleAll: () => void;
  clear: () => void;
  /** true when every key passed in is selected. */
  allSelected: boolean;
  /** true when some - but not all - are selected. */
  someSelected: boolean;
  /** Every row that matches is selected, those on no page held included. While
      it stands `selected` is empty and `count` is 0, and `isSelected(id)` is
      `!except.has(id)`. Store it with the keys when the selection is held
      outside. */
  allMatching: boolean;
  /** While `allMatching`: the keys unticked since. */
  except: ReadonlySet<T>;
  /** Selects all that match; the keys selected before are dropped. */
  selectMatching: () => void;
  count: number;
}

/**
 * A small headless helper for row selection: it holds the selection as a set
 * and supplies the states for "select all" (including indeterminate).
 * What the selection means in the domain stays the application's business.
 */
export function useTableSelection<T extends string | number>(ids: readonly T[]): TableSelection<T> {
  const [selected, setSelected] = useState<ReadonlySet<T>>(new Set());
  const [allMatching, setAllMatching] = useState(false);
  const [except, setExcept] = useState<ReadonlySet<T>>(new Set());

  const isSelected = useCallback(
    (id: T) => (allMatching ? !except.has(id) : selected.has(id)),
    [selected, allMatching, except],
  );

  const toggle = useCallback(
    (id: T) => {
      const flip = (current: ReadonlySet<T>) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      };
      if (allMatching) setExcept(flip);
      else setSelected(flip);
    },
    [allMatching],
  );

  const set = useCallback(
    (keys: readonly T[], on: boolean) => {
      const apply = (current: ReadonlySet<T>, add: boolean) => {
        const next = new Set(current);
        for (const key of keys) {
          if (add) next.add(key);
          else next.delete(key);
        }
        return next;
      };
      if (allMatching) setExcept((current) => apply(current, !on));
      else setSelected((current) => apply(current, on));
    },
    [allMatching],
  );

  const allSelected = useMemo(
    () => (allMatching ? except.size === 0 : ids.length > 0 && ids.every((id) => selected.has(id))),
    [ids, selected, allMatching, except],
  );

  const someSelected = useMemo(
    () => (allMatching ? except.size > 0 : !allSelected && ids.some((id) => selected.has(id))),
    [ids, selected, allSelected, allMatching, except],
  );

  const clear = useCallback(() => {
    setSelected(new Set());
    setAllMatching(false);
    setExcept(new Set());
  }, []);

  const selectMatching = useCallback(() => {
    setSelected(new Set());
    setExcept(new Set());
    setAllMatching(true);
  }, []);

  const toggleAll = useCallback(() => {
    if (allMatching) {
      clear();
      return;
    }
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
  }, [ids, allMatching, clear]);

  return {
    selected,
    isSelected,
    toggle,
    set,
    toggleAll,
    clear,
    allSelected,
    someSelected,
    allMatching,
    except,
    selectMatching,
    count: selected.size,
  };
}
