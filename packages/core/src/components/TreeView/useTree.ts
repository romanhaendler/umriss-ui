/* The stateful companion of the tree model.

   It is deliberately boring: it holds four values, calls the model and passes
   the transitions through. Every gesture is a pure function from treeModel,
   applied to its own snapshot. If logic wants to move in here, the model is
   missing a transition - then it belongs there, where it can be checked
   without a browser.

   Each of the four values can be controlled from outside, so that a tree can
   be restored from a link or from a stored view. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useVirtual } from "../../lib/useVirtual";
import type { VirtualRows, VirtualOptions } from "../../lib/useVirtual";
import {
  allBranches,
  treeModel,
  move as moveModel,
  duplicateKey,
  toggleCheck as toggleCheckModel,
  expand,
  collapse,
  keysBetween,
  toggleAll as toggleAllModel,
  setChecked,
  setActive,
  setAnchor,
  typeaheadTarget,
  pathTo,
  revealPath,
  type TreeSnapshot,
  type FlatteningEntry,
  type NodeReader,
  type Direction,
  type Key,
} from "./treeModel";

export interface TreeOptions<K, S extends Key = string> {
  reader: NodeReader<K, S>;
  /** Initial values, where the tree holds its own state. */
  defaultExpanded?: Iterable<S>;
  defaultChecked?: Iterable<S>;
  defaultActive?: S | null;
  /** Controlled from outside; where set, it wins over the tree's own state. */
  expanded?: ReadonlySet<S>;
  checked?: ReadonlySet<S>;
  active?: S | null;
  /** Where a range gesture spans from. Steerable from outside like the other
      four values, so that a range is repeatable. */
  anchor?: S | null;
  search?: string;
  onExpanded?: (next: ReadonlySet<S>) => void;
  onChecked?: (next: ReadonlySet<S>) => void;
  onActive?: (next: S | null) => void;
  onAnchor?: (next: S | null) => void;
  onSearch?: (text: string) => void;
  /** Enter on a node, or a click on its label. */
  onActivate?: (node: K) => void;
  /**
   * An unloaded branch has been expanded: now would be the moment to fetch its
   * children. The tree fetches nothing – it is driven by nested data, and
   * whoever adds to them sees it render anew. Concurrency, errors and
   * cancellation thereby stay outside (ADR-0005).
   */
  onLoadChildren?: (node: K) => void;
  /**
   * Render only what stands in the scroll area. Deliberately optional: a tree
   * with thirty nodes should not pay for machinery it does not need, and
   * whoever has not ordered it should not have to think about row heights.
   */
  virtual?: VirtualOptions;
}

export interface Tree<K, S extends Key = string> {
  /** The visible nodes – complete, even where only a window of them is
      rendered. Positions and sibling counts come from here and never from
      what stands in the document (ADR-0004). */
  flattening: readonly FlatteningEntry<K, S>[];
  active: S | null;
  search: string;
  toggleExpanded: (key: S) => void;
  toggleCheck: (key: S) => void;
  activate: (key: S) => void;
  move: (direction: Direction) => void;
  setSearch: (text: string) => void;
  /** Expands the ancestors, brings the row into view and sets the active
      node. Returns the key, or null if it does not exist in the data. */
  revealNode: (key: S) => S | null;
  /** Like revealNode, but with a path the caller knows and the data does not
      yet - from a deep link, say. Returns the deepest key reached; if the run
      gets stuck at an unloaded branch, that is its key, and it has been
      expanded in the process. Loading and calling again is the caller's
      business. */
  revealPath: (path: readonly S[]) => S | null;
  expandAll: () => void;
  collapseAll: () => void;
  /** Moves the active node to the next one whose label starts like this.
      Changes nothing else – not the expanding, not the checks, not the
      search. */
  typeahead: (prefix: string) => void;
  /** Checks the range from the anchor up to this node. */
  checkTo: (to: S) => void;
  /** Moves the active node **and** toggles the new one – one gesture, one
      report. Separate from move(), so that plain movement checks nothing; to
      be called instead of move(), not in addition to it. */
  moveAndCheck: (direction: Direction) => void;
  /** Checks everything checkable – or empties, if everything is on already. */
  toggleAll: () => void;
  /**
   * Counts up every explicit request "show me this node".
   *
   * Otherwise the presentation follows the focus to the active node only where
   * it already lies inside the tree - otherwise a state change from outside
   * would tear the focus away. An explicit request, however, is exactly the
   * opposite of an incidental change, and for that it needs a sign.
   */
  revealCount: number;
  /** Set where virtualisation runs; goes to `<TreeView virtual={…}>`. */
  virtual?: VirtualRows;
}

export function useTree<K, S extends Key = string>(
  roots: readonly K[],
  options: TreeOptions<K, S>,
): Tree<K, S> {
  const {
    reader,
    defaultExpanded,
    defaultChecked,
    defaultActive = null,
    expanded: expandedProp,
    checked: checkedProp,
    active: activeProp,
    anchor: anchorProp,
    search: searchProp,
    onExpanded,
    onChecked,
    onActive,
    onAnchor,
    onSearch,
    onActivate,
    onLoadChildren,
    virtual,
  } = options;

  const [ownExpanded, setOwnExpanded] = useState<ReadonlySet<S>>(
    () => new Set(defaultExpanded ?? []),
  );
  const [ownChecked, setOwnChecked] = useState<ReadonlySet<S>>(
    () => new Set(defaultChecked ?? []),
  );
  const [ownActive, setOwnActive] = useState<S | null>(defaultActive);
  const [ownAnchor, setOwnAnchor] = useState<S | null>(null);
  const [ownSearch, setOwnSearch] = useState("");
  const [revealCount, setRevealCount] = useState(0);

  const snapshot = useMemo<TreeSnapshot<S>>(
    () => ({
      expanded: expandedProp ?? ownExpanded,
      checked: checkedProp ?? ownChecked,
      active: activeProp !== undefined ? activeProp : ownActive,
      anchor: anchorProp !== undefined ? anchorProp : ownAnchor,
      search: searchProp ?? ownSearch,
    }),
    [
      expandedProp,
      ownExpanded,
      checkedProp,
      ownChecked,
      activeProp,
      ownActive,
      anchorProp,
      ownAnchor,
      searchProp,
      ownSearch,
    ],
  );

  const flattening = useMemo(
    () => treeModel(roots, reader, snapshot),
    [roots, reader, snapshot],
  );

  /* Duplicate keys break the cascade and the active node silently. The check
     runs only during development and only when the roots change - it goes
     over the whole tree. In an effect and not in the render, so that it does
     not run along on every pass. */
  useEffect(() => {
    if (!import.meta.env?.DEV) return;
    const duplicate = duplicateKey(roots, reader);
    if (duplicate !== null) {
      console.warn(
        `@umriss-ui/core: the key "${String(duplicate)}" occurs more than once in the tree. ` +
          "The cascade and the active node presuppose unique keys.",
      );
    }
  }, [roots, reader]);

  /** Take on a new snapshot: own state and report back. */
  const apply = useCallback(
    (next: TreeSnapshot<S>) => {
      if (next.expanded !== snapshot.expanded) {
        if (expandedProp === undefined) setOwnExpanded(next.expanded);
        onExpanded?.(next.expanded);
      }
      if (next.checked !== snapshot.checked) {
        if (checkedProp === undefined) setOwnChecked(next.checked);
        onChecked?.(next.checked);
      }
      if (next.anchor !== snapshot.anchor) {
        if (anchorProp === undefined) setOwnAnchor(next.anchor);
        onAnchor?.(next.anchor);
      }
      if (next.active !== snapshot.active) {
        if (activeProp === undefined) setOwnActive(next.active);
        onActive?.(next.active);
      }
    },
    [
      snapshot,
      expandedProp,
      checkedProp,
      activeProp,
      anchorProp,
      onExpanded,
      onChecked,
      onActive,
      onAnchor,
    ],
  );

  /** The entry for a key, or undefined. Needed three times - written once. */
  const entryFor = useCallback(
    (key: S) => flattening.find((e) => e.key === key),
    [flattening],
  );

  const toggleExpanded = useCallback(
    (key: S) => {
      const entry = entryFor(key);
      if (entry === undefined || !entry.branch || entry.empty) return;
      const opening = !entry.expanded;
      apply(opening ? expand(snapshot, key) : collapse(snapshot, key));
      if (opening && entry.unloaded) onLoadChildren?.(entry.node);
    },
    [entryFor, snapshot, apply, onLoadChildren],
  );

  const toggleCheck = useCallback(
    (key: S) => {
      // A single check sets the anchor at the same time: the next range
      // gesture spans from here.
      apply(setAnchor(toggleCheckModel(roots, reader, snapshot, key), key));
    },
    [roots, reader, snapshot, apply],
  );

  /** Check the range from the anchor to here. Without an anchor the active
      node counts. */
  const checkTo = useCallback(
    (to: S) => {
      const from = snapshot.anchor ?? snapshot.active;
      if (from === null) return;
      apply(setChecked(roots, reader, snapshot, keysBetween(flattening, from, to), true));
    },
    [roots, reader, snapshot, flattening, apply],
  );

  /* Moving and checking in one go: the snapshot after the movement is the
     basis of the check, otherwise the gesture would toggle the node one is
     just leaving. */
  const moveAndCheck = useCallback(
    (direction: Direction) => {
      const afterMove = moveModel(flattening, snapshot, direction);
      if (afterMove.active === null || afterMove.active === snapshot.active) return;
      apply(
        setAnchor(
          toggleCheckModel(roots, reader, afterMove, afterMove.active),
          afterMove.active,
        ),
      );
    },
    [flattening, snapshot, roots, reader, apply],
  );

  const toggleAll = useCallback(
    () => apply(toggleAllModel(roots, reader, snapshot)),
    [roots, reader, snapshot, apply],
  );

  const activate = useCallback(
    (key: S) => {
      apply(setActive(snapshot, key));
      const entry = entryFor(key);
      if (entry !== undefined) onActivate?.(entry.node);
    },
    [snapshot, apply, entryFor, onActivate],
  );

  const move = useCallback(
    (direction: Direction) => apply(moveModel(flattening, snapshot, direction)),
    [flattening, snapshot, apply],
  );

  const revealPathGesture = useCallback(
    (path: readonly S[]): S | null => {
      const { snapshot: after, reached } = revealPath(roots, reader, snapshot, path);
      if (reached === null) return null;
      apply(setActive(after, reached));
      setRevealCount((n) => n + 1);
      return reached;
    },
    [roots, reader, snapshot, apply],
  );

  const revealNode = useCallback(
    (key: S): S | null => {
      const path = pathTo(roots, reader, key);
      return path === null ? null : revealPathGesture(path);
    },
    [roots, reader, revealPathGesture],
  );

  const expandAll = useCallback(() => {
    apply({ ...snapshot, expanded: new Set(allBranches(roots, reader)) });
  }, [roots, reader, snapshot, apply]);

  const collapseAll = useCallback(() => {
    apply({ ...snapshot, expanded: new Set<S>() });
  }, [snapshot, apply]);

  const typeahead = useCallback(
    (prefix: string) => {
      const target = typeaheadTarget(flattening, prefix, snapshot.active);
      if (target !== null) apply(setActive(snapshot, target));
    },
    [flattening, snapshot, apply],
  );

  const setSearch = useCallback(
    (text: string) => {
      if (searchProp === undefined) setOwnSearch(text);
      onSearch?.(text);
    },
    [searchProp, onSearch],
  );

  const rowWindow = useVirtual(virtual ? flattening.length : 0, {
    rowHeight: virtual?.rowHeight ?? 0,
    overscan: virtual?.overscan,
  });

  return {
    flattening,
    virtual: virtual ? rowWindow : undefined,
    active: snapshot.active,
    search: snapshot.search,
    toggleExpanded,
    toggleCheck,
    activate,
    move,
    setSearch,
    revealNode,
    revealPath: revealPathGesture,
    revealCount,
    expandAll,
    collapseAll,
    typeahead,
    checkTo,
    moveAndCheck,
    toggleAll,
  };
}
