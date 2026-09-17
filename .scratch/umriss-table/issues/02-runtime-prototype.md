# 02 — Runtime prototype: registration, identity, first frame

Status: done
Type: prototype

Blocked by: 01

Spec: `.scratch/umriss-table/spec.md`

## Scope

The smallest runtime that answers what the compiler cannot: `useTabelle` returning `Table` and `Column`, columns with `value` and `children`, defaults for strings and numbers, hiding and reordering. Measure:

- **Identity.** Do the building blocks returned by the hook keep their identity across renders? Count column mounts over a series of parent re-renders.
- **First frame.** Does the first painted frame contain the columns? Compare registration during render through an external store, in a layout effect, and in an effect.
- **Render passes.** How many passes does an update take with a column wrapped in a component of the caller's own? React Aria needs two; the target is one.
- **Strict Mode.** Registration under double mount and unmount.
- **Lint.** Whether the repo's `react-hooks` rules object to components obtained from a hook, and what that costs.

## Acceptance

- Measurements and a recommended registration mechanism recorded under `## Comments`.
- The spec's open item "The first frame" resolved, or the spec amended.

## Notes

Throwaway, in `.scratch/umriss-table/prototype/`. No styling, no model beyond sort and hide.

## Comments

**Delivered** in `.scratch/umriss-table/prototype/laufzeit/`: `prototyp.tsx` (hook, `Table`, `Column`, string/number defaults, hide, reorder, sort) in three registration variants, `messung.test.tsx` (24 cases, green), results in `messwerte.json`. Run: `node_modules/.bin/vitest run --config .scratch/umriss-table/prototype/vitest.config.ts`.

The three variants:

- **effect** — a column registers its description in `useEffect`.
- **layout** — in `useLayoutEffect`, including its functions (`value`, `children`).
- **render** — a column writes its description into the hook's register *while rendering*; the table body is a sibling rendered after the children, so it reads the columns of the same pass. A layout effect only announces what changed in *structure* (membership, id, label), and hidden `<span data-spalte>` markers let the table correct the order from the DOM after commit.

### Measurements

| | effect | layout | render |
|---|---|---|---|
| Column mounts after 5 caller re-renders (2 columns) | 2 | 2 | 2 |
| Body renders per caller update, inline `children` | **2** | **2** | **1** |
| Body renders, wrapped column: caller update / wrapper's own update | 2 / 1 | 2 / 1 | 1 / 1 |
| Header cells in the first frame, body subscribed with `useSyncExternalStore` | **0** | **0** | 2 |
| Header cells in the first frame, body subscribed in a layout effect | 2¹ | 2 | 2 |
| Column inserted in the middle (`Name, Ort, Menge`) | ✓ | ✓ | ✓ |
| Strict Mode: mount, reorder, hide, insert | ✓ | ✓ | ✓² |
| Sort reads the registered values | ✓ | ✓ | ✓ |

¹ Only incidentally: the order check forced a synchronous pass, and React flushes pending passive effects before any new render. Without that, effect registration paints a table without columns first.
² After a fix the prototype needed: Strict Mode replays mount effects, and the cleanup in between deleted a column registered during render. The mount effect now re-registers the description it captured — idempotently.

**Identity.** Building blocks created once per hook call (`useState(() => build(register))`) keep their identity in all variants; no column remounts on caller re-renders.

**First frame.** `useSyncExternalStore` subscribes in a *passive* effect. Anything a column announces in a layout effect during mount reaches such a subscriber only after paint — so the layout variant is first-frame-correct only if the body subscribes in a layout effect of its own. The render variant needs no announcement on mount: the body already rendered with the columns.

**Render passes.** Any variant that registers functions from an effect sees a new `children` function on every caller render, so every caller update renders the body twice (the React Aria cost). The render variant renders it once. A wrapper's own state change costs one body render in all variants.

**Strict Mode.** Double render and double mount leave the register consistent once registration is idempotent and keyed by `useId`.

**Lint** (repo's `react-hooks` 7.1.1 recommended rules, on `lintprobe.tsx` and `prototyp.tsx`):

- Components obtained from a hook — destructured (`const { Table } = useTabelle()`) or dotted (`<t.Table>`) — raise nothing.
- A component created during render raises `react-hooks/static-components`. That is exactly the identity mistake, so the rule guards the design rather than fighting it.
- Writing to or reading a ref during render raises `react-hooks/refs`; mutating a property of a captured object raises `react-hooks/immutability`. A method call on the register during render raises nothing — the compiler cannot see into it. The cost: the register's writes must *be* idempotent by construction and say so, because no lint will notice if they are not.

### Recommendation

**Registration during render into a register owned by the hook call**, with:

1. writes that are idempotent (same description → no change) and keyed by `useId`;
2. the table body rendered as a sibling *after* the children, so it reads the columns of its own pass;
3. a version that changes only with structure; a layout effect announces it, and subscribers that already rendered it skip;
4. the order taken from the render pass, corrected after commit from DOM markers when a column rendered alone (a memoised wrapper);
5. mount effects that re-register what they captured, for Strict Mode.

**Server rendering: not supported, stated.** The render variant would produce the right first HTML in principle — the body reads the columns of the same pass — but nothing here tested it, and the order correction is DOM-only.

The spec's open item "The first frame" is resolved in the spec accordingly.
