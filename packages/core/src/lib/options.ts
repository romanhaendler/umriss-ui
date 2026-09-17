/* Logic for option lists: searching, set operations, keyboard navigation.
   Shared by Combobox and MultiSelect - hence here and not in one of the two
   component folders. Pure functions, no React. */

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Searches in the label, disregarding case; whitespace at the edges does not
 * count. An empty query returns the list unchanged. Disabled options stay
 * visible - they are merely not selectable.
 */
export function filterOptions<T extends string>(
  options: readonly SelectOption<T>[],
  search: string,
): readonly SelectOption<T>[] {
  const term = search.trim().toLowerCase();
  if (!term) return options;
  return options.filter((option) => option.label.toLowerCase().includes(term));
}

/** The values that may be selected at all. */
export function selectableValues<T extends string>(options: readonly SelectOption<T>[]): T[] {
  return options.filter((option) => !option.disabled).map((option) => option.value);
}

/* The three set operations work on `subset` - typically the filtered,
   selectable values. Selections outside it stay untouched: whoever filters and
   then chooses "all" loses nothing he had before. */

/** Adds the whole subset to the selection. */
export function selectAllOf<T extends string>(selection: readonly T[], subset: readonly T[]): T[] {
  const next = new Set(selection);
  subset.forEach((value) => next.add(value));
  return [...next];
}

/** Removes the whole subset from the selection. */
export function selectNoneOf<T extends string>(selection: readonly T[], subset: readonly T[]): T[] {
  const remove = new Set(subset);
  return selection.filter((value) => !remove.has(value));
}

/** Inverts the selection within the subset. */
export function invertSelection<T extends string>(selection: readonly T[], subset: readonly T[]): T[] {
  const current = new Set(selection);
  subset.forEach((value) => {
    if (current.has(value)) current.delete(value);
    else current.add(value);
  });
  return [...current];
}

/** The next list index; it wraps at both ends. */
export function nextIndex(current: number, count: number, direction: 1 | -1): number {
  if (count <= 0) return 0;
  return (current + direction + count) % count;
}

/**
 * The index the navigation stands on when opening. Where the selection is not
 * in the list - because it is filtered, say - it begins at the top.
 */
export function startIndex<T extends string>(
  options: readonly SelectOption<T>[],
  selection: T | null,
): number {
  if (selection === null) return 0;
  const index = options.findIndex((option) => option.value === selection);
  return index === -1 ? 0 : index;
}
