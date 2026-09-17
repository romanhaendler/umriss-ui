/* The tree's model: out of roots and a reader comes the flattening - the
   visible nodes in reading order, each with its level.

   The flattening is the component's actual data structure. Everything after
   it - keyboard movement, virtualisation, rendering, indentation - reads this
   list, and nothing walks the tree any more. That is at the same time the
   reason why the accessibility layer is flat: nesting and virtualisation rule
   each other out (ADR-0004).

   The active node and the checked set are two states and are never derived
   from one another (ADR-0003). Checks cascade downwards and reconcile
   upwards; the indeterminate state of a partially checked branch is computed
   from its descendants every time and never stored.

   The state transitions live here and not in the hook: that keeps the
   companion a pure state holder without logic of its own, and everything that
   is hard about a tree can be checked without a browser. */

export type Key = string | number;

/** How a node is read - handed over once, not per node. The node's own type
    thereby stays entirely the caller's. */
export interface NodeReader<K, S extends Key = string> {
  key: (node: K) => S;
  /** `undefined` means leaf, an empty list means empty branch - the
      difference is visible and intended. */
  children: (node: K) => readonly K[] | undefined;
  /** Text the search checks against. */
  label: (node: K) => string;
  /** May this node be checked? Without an answer: everyone may.
      Disabled is a statement about the checkbox, not about the node -
      it stays navigable (ADR-0005). */
  disabled?: (node: K) => boolean;
  /** Can this branch have children that are not present? Without an answer:
      no. Its own name instead of an overloaded return value: putting `null`
      against `undefined` would be the kind of distinction that is got wrong
      more often than right. */
  unloaded?: (node: K) => boolean;
}

export interface TreeSnapshot<S extends Key = string> {
  expanded: ReadonlySet<S>;
  checked: ReadonlySet<S>;
  active: S | null;
  /** Where a range selection spans from: the node checked last on its own.
      Neither the active one nor part of the checked set - it stands in the
      snapshot so that a range is repeatable and steerable from outside. */
  anchor: S | null;
  search: string;
}

export interface FlatteningEntry<K, S extends Key = string> {
  node: K;
  key: S;
  /** Roots stand at 0. Drives the indentation and what is read out. */
  level: number;
  /** The node's text; here, so that typeahead can be a pure function over
      the flattening and needs no reader. */
  label: string;
  branch: boolean;
  /** Branch without content: expanding it showed nothing. An unloaded branch
      is not empty - it could have children. */
  empty: boolean;
  /** May not be checked (ADR-0005). It stays navigable. */
  disabled: boolean;
  /** Could have children that are not present. For checking exactly the same
      as disabled: whatever has to reach its descendants may not act on it. */
  unloaded: boolean;
  expanded: boolean;
  checked: boolean;
  /** Derived: not checked itself, but at least one descendant is. */
  indeterminate: boolean;
  active: boolean;
  /** Matched the search itself. Without a search text every entry matches, so
      that the surface needs no special case. */
  matches: boolean;
  /** Stands there only because a descendant matches - a signpost. The surface
      dims these and only these. A child under a matching branch is neither a
      match nor a signpost but context: it stays normal. */
  pathOnly: boolean;
  /** 1-based, among the siblings that survive the filter. */
  position: number;
  siblings: number;
}

export type Direction = "up" | "down" | "in" | "out" | "start" | "end";

/** A node the cascade may not touch: disabled, or with descendants nobody has
    seen. One rule, two reasons (ADR-0005). */
function mayBeChecked<K, S extends Key>(reader: NodeReader<K, S>, node: K): boolean {
  return reader.disabled?.(node) !== true && reader.unloaded?.(node) !== true;
}

/* ================= Flattening ================= */

interface Preparation<S extends Key> {
  /** Key -> indeterminate (derived). */
  indeterminate: Set<S>;
  /** Key -> survives the search text. */
  survives: Set<S>;
  /** Key -> matches itself. */
  matches: Set<S>;
  /** Key -> has at least one matching descendant. */
  descendantMatches: Set<S>;
}

/** One pass from the bottom up for both derived quantities. Separate passes
    would be two places for one rule each. */
function prepare<K, S extends Key>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
): Preparation<S> {
  const text = snapshot.search.trim().toLowerCase();
  const pre: Preparation<S> = {
    indeterminate: new Set<S>(),
    survives: new Set<S>(),
    matches: new Set<S>(),
    descendantMatches: new Set<S>(),
  };

  /** Returns [anyDescendantChecked, survives]. */
  function walk(node: K): [boolean, boolean] {
    const id = reader.key(node);
    const children = reader.children(node);
    const selfChecked = snapshot.checked.has(id);
    const selfMatches = text === "" || reader.label(node).toLowerCase().includes(text);
    if (selfMatches) pre.matches.add(id);

    let anyChecked = selfChecked;
    let descendantMatches = false;
    for (const child of children ?? []) {
      const [checked, survives] = walk(child);
      if (checked) anyChecked = true;
      if (survives) descendantMatches = true;
    }

    const isBranch = children !== undefined;
    if (isBranch && !selfChecked && anyChecked) pre.indeterminate.add(id);

    if (descendantMatches) pre.descendantMatches.add(id);
    /* An unloaded branch cannot be searched. Dropping it silently would mean
       claiming it contains nothing - it therefore survives every filter and
       says in its entry why. */
    const survives = selfMatches || descendantMatches || reader.unloaded?.(node) === true;
    if (survives) pre.survives.add(id);
    return [anyChecked, survives];
  }

  for (const root of roots) walk(root);
  return pre;
}

/**
 * The visible nodes in reading order.
 *
 * While a search runs: a node survives if it matches itself or a descendant
 * matches - so a match always appears together with the path that leads to it.
 * A branch that stands there only because of its descendant is treated as if
 * it were open, **without the expanded state being written**: if the search
 * text falls away, the tree stands exactly as it did before. A branch that
 * matches itself brings its whole subtree along, but only visibly so if it is
 * actually expanded.
 */
export function treeModel<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
): readonly FlatteningEntry<K, S>[] {
  const searching = snapshot.search.trim() !== "";
  const pre = prepare(roots, reader, snapshot);
  const out: FlatteningEntry<K, S>[] = [];

  function build(nodes: readonly K[], level: number, insideMatch: boolean): void {
    const surviving = insideMatch
      ? nodes
      : nodes.filter((n) => !searching || pre.survives.has(reader.key(n)));

    surviving.forEach((n, i) => {
      const id = reader.key(n);
      const children = reader.children(n);
      const unloaded = reader.unloaded?.(n) === true;
      // An unloaded node is a branch even though nothing is there yet -
      // otherwise it would look like a leaf and nobody would ever expand it.
      const branch = children !== undefined || unloaded;
      const empty = branch && !unloaded && (children ?? []).length === 0;
      const selfMatches = pre.matches.has(id);
      /* The rule is plain: **every match is visible**. Whoever has a matching
         descendant is shown expanded - even if it matches itself, and even
         deep inside a matching subtree. Otherwise a match would go to waste
         underneath a match. The expanded state is not written while doing so.

         Whoever matches itself and has no matching descendant keeps its own
         state: its subtree is context, not a finding. */
      const signpost = searching && !selfMatches && pre.descendantMatches.has(id);
      const showsPath = searching && pre.descendantMatches.has(id);
      const expanded = !empty && branch && (showsPath || snapshot.expanded.has(id));

      out.push({
        node: n,
        key: id,
        level,
        label: reader.label(n),
        branch,
        empty,
        disabled: reader.disabled?.(n) === true,
        unloaded,
        expanded,
        checked: snapshot.checked.has(id),
        indeterminate: pre.indeterminate.has(id),
        active: snapshot.active === id,
        matches: !searching || selfMatches,
        pathOnly: signpost,
        position: i + 1,
        siblings: surviving.length,
      });

      if (expanded) {
        build(children ?? [], level + 1, insideMatch || selfMatches);
      }
    });
  }

  build(roots, 0, false);
  return out;
}

/* ================= Transitions ================= */

export function expand<S extends Key>(
  snapshot: TreeSnapshot<S>,
  key: S,
): TreeSnapshot<S> {
  if (snapshot.expanded.has(key)) return snapshot;
  const next = new Set(snapshot.expanded);
  next.add(key);
  return { ...snapshot, expanded: next };
}

export function collapse<S extends Key>(
  snapshot: TreeSnapshot<S>,
  key: S,
): TreeSnapshot<S> {
  if (!snapshot.expanded.has(key)) return snapshot;
  const next = new Set(snapshot.expanded);
  next.delete(key);
  return { ...snapshot, expanded: next };
}

export function setActive<S extends Key>(
  snapshot: TreeSnapshot<S>,
  key: S | null,
): TreeSnapshot<S> {
  if (snapshot.active === key) return snapshot;
  return { ...snapshot, active: key };
}

/**
 * Move the active node.
 *
 * `in` and `out` have two meanings each, and that is intended: one key goes
 * deeper, no matter whether something has to be opened for it first. Doing
 * both at once - opening *and* stepping inside - makes the tree impossible to
 * inspect without expanding it.
 */
export function move<K, S extends Key = string>(
  flattening: readonly FlatteningEntry<K, S>[],
  snapshot: TreeSnapshot<S>,
  direction: Direction,
): TreeSnapshot<S> {
  if (flattening.length === 0) return snapshot;
  const first = flattening[0] as FlatteningEntry<K, S>;
  const last = flattening[flattening.length - 1] as FlatteningEntry<K, S>;

  if (direction === "start") return setActive(snapshot, first.key);
  if (direction === "end") return setActive(snapshot, last.key);

  const i = flattening.findIndex((e) => e.key === snapshot.active);
  if (i < 0) return setActive(snapshot, first.key);
  const here = flattening[i] as FlatteningEntry<K, S>;

  switch (direction) {
    case "down": {
      const next = flattening[i + 1];
      return next === undefined ? snapshot : setActive(snapshot, next.key);
    }
    case "up": {
      const previous = flattening[i - 1];
      return previous === undefined ? snapshot : setActive(snapshot, previous.key);
    }
    case "in": {
      if (!here.branch || here.empty) return snapshot;
      if (!here.expanded) return expand(snapshot, here.key);
      const child = flattening[i + 1];
      return child === undefined ? snapshot : setActive(snapshot, child.key);
    }
    case "out": {
      if (here.branch && here.expanded) return collapse(snapshot, here.key);
      for (let k = i - 1; k >= 0; k--) {
        const candidate = flattening[k] as FlatteningEntry<K, S>;
        if (candidate.level < here.level) return setActive(snapshot, candidate.key);
      }
      return snapshot;
    }
  }
}

/* ================= Checking ranges ================= */

export function setAnchor<S extends Key>(
  snapshot: TreeSnapshot<S>,
  key: S | null,
): TreeSnapshot<S> {
  if (snapshot.anchor === key) return snapshot;
  return { ...snapshot, anchor: key };
}

/** The checkable keys between two visible nodes, both ends included and
    independent of their order. Whatever may not be checked drops out: the
    gesture does what it can instead of nothing. */
export function keysBetween<K, S extends Key = string>(
  flattening: readonly FlatteningEntry<K, S>[],
  from: S,
  to: S,
): S[] {
  const i = flattening.findIndex((e) => e.key === from);
  const j = flattening.findIndex((e) => e.key === to);
  if (i < 0 || j < 0) return [];
  const [start, end] = i <= j ? [i, j] : [j, i];
  const out: S[] = [];
  for (let k = start; k <= end; k++) {
    const entry = flattening[k] as FlatteningEntry<K, S>;
    if (!entry.disabled && !entry.unloaded) out.push(entry.key);
  }
  return out;
}

/** Node, parent and depth per key - one pass, so that cascade and
    reconciliation manage without repeated searching. */
interface NodeIndex<K, S extends Key> {
  nodes: Map<S, K>;
  parents: Map<S, S | null>;
  depth: Map<S, number>;
}

function indexNodes<K, S extends Key>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
): NodeIndex<K, S> {
  const index: NodeIndex<K, S> = { nodes: new Map(), parents: new Map(), depth: new Map() };
  function walk(n: K, parent: S | null, depth: number): void {
    const id = reader.key(n);
    index.nodes.set(id, n);
    index.parents.set(id, parent);
    index.depth.set(id, depth);
    for (const child of reader.children(n) ?? []) walk(child, id, depth + 1);
  }
  for (const root of roots) walk(root, null, 0);
  return index;
}

/**
 * Sets a set of nodes to checked or unchecked - and does not toggle.
 *
 * That is the decision which separates a range from a sequence of single
 * clicks: if it contains a branch *and* one of its children, a sequence of
 * toggles would touch the child twice and uncheck it again. Every target is
 * set together with its descendants; afterwards all ancestors of the targets
 * are reconciled, from the bottom up - and only those.
 */
export function setChecked<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
  targets: readonly S[],
  on: boolean,
): TreeSnapshot<S> {
  if (targets.length === 0) return snapshot;
  const index = indexNodes(roots, reader);
  const next = new Set(snapshot.checked);

  function cascade(n: K): void {
    if (mayBeChecked(reader, n)) {
      const id = reader.key(n);
      if (on) next.add(id);
      else next.delete(id);
    }
    for (const child of reader.children(n) ?? []) cascade(child);
  }

  /** Reconciles a whole subtree from the bottom up.

      The cascade sets every node inside it - intermediate branches included,
      underneath which a disabled or unloaded node has been left behind.
      Whoever reconciles only the path from the root to the touched node
      leaves exactly those intermediate branches on what the cascade set:
      they claimed to be full while something underneath them is outstanding.
      That is rule 2 of ADR-0005, and it holds at every level. */
  function reconcileSubtree(n: K): void {
    const children = reader.children(n) ?? [];
    if (children.length === 0) return;
    for (const child of children) reconcileSubtree(child);
    if (!mayBeChecked(reader, n)) return;
    const id = reader.key(n);
    const all = children.every((child) => next.has(reader.key(child)));
    if (all) next.add(id);
    else next.delete(id);
  }

  const toReconcile = new Set<S>();
  let touched = false;
  for (const target of targets) {
    const n = index.nodes.get(target);
    if (n === undefined || !mayBeChecked(reader, n)) continue;
    touched = true;
    cascade(n);
    reconcileSubtree(n);
    let run: S | null = index.parents.get(target) ?? null;
    while (run !== null) {
      toReconcile.add(run);
      run = index.parents.get(run) ?? null;
    }
  }
  /* No target touched means: nothing to reconcile. Otherwise a gesture
     without effect would "repair" a snapshot that was set from outside. */
  if (!touched) return snapshot;

  const byDepth = [...toReconcile].sort(
    (x, y) => (index.depth.get(y) ?? 0) - (index.depth.get(x) ?? 0),
  );
  for (const id of byDepth) {
    const n = index.nodes.get(id);
    if (n === undefined || !mayBeChecked(reader, n)) continue;
    const children = reader.children(n) ?? [];
    if (children.length === 0) continue;
    const all = children.every((child) => next.has(reader.key(child)));
    if (all) next.add(id);
    else next.delete(id);
  }

  return { ...snapshot, checked: next };
}

/**
 * Toggling means: check - and if that changes nothing any more, uncheck.
 *
 * The direction may **not** come from the node's own checked state. A branch
 * with a disabled or unloaded child can by rule 2 never be checked itself;
 * its direction would permanently be "check", the first click would set
 * everything checkable and every further one the same thing again. The tree
 * would be stuck - and precisely in those trees that have disabled nodes.
 *
 * "Full" therefore means the same thing everywhere: checking would change
 * nothing any more. For a leaf that coincides with "is checked".
 */
function toggleKeys<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
  targets: readonly S[],
): TreeSnapshot<S> {
  const on = setChecked(roots, reader, snapshot, targets, true);
  const alreadyFull =
    on.checked.size === snapshot.checked.size &&
    [...on.checked].every((id) => snapshot.checked.has(id));
  return alreadyFull ? setChecked(roots, reader, snapshot, targets, false) : on;
}

/** Everything checkable on - or empty, if everything is on already. */
export function toggleAll<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
): TreeSnapshot<S> {
  const index = indexNodes(roots, reader);
  const checkable: S[] = [];
  for (const [id, n] of index.nodes) if (mayBeChecked(reader, n)) checkable.push(id);
  if (checkable.length === 0) return snapshot;
  return toggleKeys(roots, reader, snapshot, checkable);
}

/**
 * Toggle a check: cascade downwards, reconcile upwards.
 *
 * A single check is a range of one target - which is why the arithmetic
 * stands there only once, and the direction comes from the same definition of
 * "full" as in toggleAll. If the node is not checkable or does not exist, the
 * snapshot stays unchanged.
 */
export function toggleCheck<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
  key: S,
): TreeSnapshot<S> {
  return toggleKeys(roots, reader, snapshot, [key]);
}

/* ================= Typeahead ================= */

/**
 * The next visible node whose label starts like this - or null.
 *
 * A single letter searches **behind** the active node, so that the same
 * letter pressed twice jumps onwards instead of finding the same node again.
 * Several letters search **from** the active node, so that refining does not
 * jump onwards. Both are intended and are the reason why the length of the
 * prefix matters here.
 *
 * At the end it wraps around. Disabled and unloaded nodes are valid targets:
 * typeahead moves only the focus, and both are navigable.
 */
export function typeaheadTarget<K, S extends Key = string>(
  flattening: readonly FlatteningEntry<K, S>[],
  prefix: string,
  active: S | null,
): S | null {
  const wanted = prefix.toLowerCase();
  if (wanted === "" || flattening.length === 0) return null;
  const here = flattening.findIndex((e) => e.key === active);
  const from = here < 0 ? 0 : wanted.length === 1 ? here + 1 : here;
  for (let n = 0; n < flattening.length; n++) {
    const entry = flattening[(from + n) % flattening.length] as FlatteningEntry<K, S>;
    if (entry.label.toLowerCase().startsWith(wanted)) return entry.key;
  }
  return null;
}

/* ================= Reaching a node ================= */

/** The keys from the root down to the target, the target included; null if
    the key does not exist in the data. */
export function pathTo<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  key: S,
): S[] | null {
  function walk(node: K, path: S[]): S[] | null {
    const id = reader.key(node);
    path.push(id);
    if (id === key) return path;
    for (const child of reader.children(node) ?? []) {
      const found = walk(child, path);
      if (found !== null) return found;
    }
    path.pop();
    return null;
  }
  for (const root of roots) {
    const found = walk(root, []);
    if (found !== null) return found;
  }
  return null;
}

/**
 * Expands along a path as far as the data reaches, and reports the deepest
 * key it got to.
 *
 * The path is handed over and not searched for: a deep link knows it, the
 * data does not know it yet. If the run gets stuck at an unloaded branch,
 * that branch's key is the answer - and because it is expanded in the
 * process, it triggers the loading at the same time. The caller loads and
 * calls again; the same loop it already has for expanding anyway.
 *
 * The target itself is not expanded: it is meant to be shown, not opened.
 */
export function revealPath<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
  snapshot: TreeSnapshot<S>,
  path: readonly S[],
): { snapshot: TreeSnapshot<S>; reached: S | null } {
  let candidates: readonly K[] = roots;
  let reached: S | null = null;
  const next = new Set(snapshot.expanded);

  for (let i = 0; i < path.length; i++) {
    const wanted = path[i] as S;
    const node = candidates.find((n) => reader.key(n) === wanted);
    if (node === undefined) break;
    reached = wanted;
    const children = reader.children(node);
    const isBranch = children !== undefined || reader.unloaded?.(node) === true;
    const empty = isBranch && reader.unloaded?.(node) !== true && (children ?? []).length === 0;
    // Only open it if things continue underneath this node.
    if (i < path.length - 1 && isBranch && !empty) next.add(wanted);
    candidates = children ?? [];
  }

  if (reached === null) return { snapshot, reached: null };
  return { snapshot: { ...snapshot, expanded: next }, reached };
}

/** Every loaded branch with content. Empty ones stay out because expanding
    them showed nothing; unloaded ones stay out because one click would
    otherwise trigger a thousand requests (ADR-0005). */
export function allBranches<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
): S[] {
  const out: S[] = [];
  function walk(node: K): void {
    const children = reader.children(node);
    if (children !== undefined && children.length > 0 && reader.unloaded?.(node) !== true) {
      out.push(reader.key(node));
    }
    for (const child of children ?? []) walk(child);
  }
  for (const root of roots) walk(root);
  return out;
}

/* ================= Checking the data ================= */

/** The first key that occurs twice, otherwise null. Two nodes with the same
    key break the cascade and the active node silently - the companion reports
    that during development. */
export function duplicateKey<K, S extends Key = string>(
  roots: readonly K[],
  reader: NodeReader<K, S>,
): S | null {
  const seen = new Set<S>();
  let found: S | null = null;
  function walk(node: K): void {
    if (found !== null) return;
    const id = reader.key(node);
    if (seen.has(id)) {
      found = id;
      return;
    }
    seen.add(id);
    for (const child of reader.children(node) ?? []) walk(child);
  }
  for (const root of roots) walk(root);
  return found;
}
