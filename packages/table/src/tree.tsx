/* Tree rows and row details: the setup the frame builds once per render, the
   fold that carries a tree cell, and the open details the grid's walk needs. */

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { VisuallyHidden } from "@umriss-ui/core";
import type { FlatteningEntry, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import type { HookSnapshot, Registry, ColumnEntry } from "./registry";
import type { TableSnapshot } from "./types";
import { FoldMark } from "./groupLines";
import styles from "./Table.module.css";

/** A row's detail as it stands, or null where it comes to nothing - a
    branch whose records hang only from its leaves gets no expander and no
    empty line. In a tree a branch's detail follows the branch: one fold, one
    state - opened by default, by a view or by unfolding all along with its
    children. Elsewhere the row's own expansion. Asked on every render: it is
    an element the caller returns, not yet rendered. */
export function detailOf(
  registry: Registry,
  snapshot: TableSnapshot<unknown>,
  row: unknown,
  key: string,
  entry: FlatteningEntry<unknown> | undefined,
): { content: ReactNode; open: boolean } | null {
  const content = registry.detail?.presentation(row as never);
  if (content === null || content === undefined || content === false) return null;
  const branch = entry !== undefined && entry.branch && !entry.empty;
  return { content, open: branch ? snapshot.branches.includes(key) : snapshot.expanded.includes(key) };
}

/** The keys whose detail stands open - for the grid's walk, which needs the
    lines the body draws. */
export function openDetails(
  registry: Registry,
  snapshot: TableSnapshot<unknown>,
  rows: readonly unknown[],
  rowKey: (row: unknown) => string,
  tree: TreeSetup | undefined,
): Set<string> {
  const wanted = new Set([...snapshot.expanded, ...snapshot.branches]);
  const out = new Set<string>();
  for (const row of rows) {
    const key = rowKey(row);
    if (wanted.has(key) && detailOf(registry, snapshot, row, key, tree?.entry(row))?.open) out.add(key);
  }
  return out;
}

/** What the body needs to draw tree rows - built once per render in the frame. */
export interface TreeSetup {
  /** The column that carries the tree. */
  column: ColumnEntry | undefined;
  /** Whether a root follows the row - its last line draws the root's line. */
  beforeRoot: (key: string) => boolean;
  entry: (row: unknown) => FlatteningEntry<unknown> | undefined;
  parent: (key: string) => string | undefined;
  /** Opens or closes a branch - the open branches, never the search's path. */
  set: (key: string, open: boolean) => void;
  siblings: (key: string, open: boolean) => void;
}

/* The indent per level, then the fold - a leaf keeps its slot so that the
   labels of one level align - then the cell. The fold is the group header's,
   with its keys: Right opens, Left closes or goes to the parent's fold, Alt
   acts on the siblings as well. */
/** A row's detail in a tree: its fold opens it. */
export interface TreeDetail {
  open: boolean;
  toggle: () => void;
}

export function TreeCellContent({
  setup,
  entry,
  detail,
  name,
  wording,
  children,
}: {
  setup: TreeSetup;
  entry: FlatteningEntry<unknown>;
  detail?: TreeDetail;
  name: string;
  wording: Wording;
  children: ReactNode;
}) {
  const branch = entry.branch && !entry.empty;
  const opens = branch || detail !== undefined;
  /* The fold opens what stands under the row: its detail, then its children. */
  const open = (branch && entry.expanded) || (detail?.open ?? false);
  const set = (wanted: boolean) => {
    if (branch) setup.set(entry.key, wanted);
    if (detail && detail.open !== wanted) detail.toggle();
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (event.altKey) return setup.siblings(entry.key, event.key === "ArrowRight");
    if (event.key === "ArrowRight") {
      if (!open) set(true);
    } else if (open) set(false);
    else {
      const parent = setup.parent(entry.key);
      const table = event.currentTarget.closest("table");
      const target = Array.from(table?.querySelectorAll<HTMLButtonElement>("[data-branch-key]") ?? []).find((b) => b.dataset.branchKey === parent);
      target?.focus();
    }
  };
  return (
    <span className={styles.treeCell} style={{ "--_table-tree-level": entry.level } as CSSProperties}>
      {opens ? (
        <button
          type="button"
          className={cx(styles.fold, !open && styles.foldClosed)}
          data-branch-key={entry.key}
          aria-expanded={open}
          aria-label={open ? wording.foldBranch(name) : wording.unfoldBranch(name)}
          onKeyDown={onKeyDown}
          onClick={(event) => (event.altKey ? setup.siblings(entry.key, !open) : set(!open))}
        >
          <FoldMark />
        </button>
      ) : (
        <span className={styles.foldSlot} />
      )}
      <span className={styles.treeText}>
        {children}
        {entry.pathOnly && <VisuallyHidden>{`, ${wording.pathRow}`}</VisuallyHidden>}
      </span>
    </span>
  );
}

/** The tree of a flattening: the lookups its rows and folds ask. */
export function buildTree(
  entries: readonly FlatteningEntry<unknown>[],
  hook: HookSnapshot,
  snapshot: TableSnapshot<unknown>,
  column: ColumnEntry | undefined,
): TreeSetup {
  const byKey = new Map<string, FlatteningEntry<unknown>>();
  const parentOf = new Map<string, string | undefined>();
  const beforeRoot = new Set<string>();
  const path: string[] = [];
  entries.forEach((entry, i) => {
    byKey.set(entry.key, entry);
    path.length = entry.level;
    parentOf.set(entry.key, path.at(-1));
    path.push(entry.key);
    if (entries[i + 1]?.level === 0) beforeRoot.add(entry.key);
  });
  return {
    column,
    entry: (row) => byKey.get(hook.rowKey(row)),
    beforeRoot: (key) => beforeRoot.has(key),
    parent: (key) => parentOf.get(key),
    /* Against the open branches, not against what is shown: a branch open
       only on the way to a match is not open, and folding it must not
       open it once the search is gone. */
    set: (key, open) => {
      if (snapshot.branches.includes(key) !== open) snapshot.toggleBranch(key);
    },
    /* Alt on a fold acts on the branch and its siblings, as on a group header. */
    siblings: (key, open) => {
      const parent = parentOf.get(key);
      for (const entry of entries) {
        if (parentOf.get(entry.key) === parent && entry.branch && !entry.empty && snapshot.branches.includes(entry.key) !== open) {
          snapshot.toggleBranch(entry.key);
        }
      }
    },
  };
}
