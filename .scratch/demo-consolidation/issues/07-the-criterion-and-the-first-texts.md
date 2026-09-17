# 07 — "Why it is like this" gets its criterion where it can be found

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/demo-consolidation/spec.md` (**Further Notes**, the correction)

## Scope

Fourteen of core's forty pages and six of table's twelve carry a "Why it is like this". The criterion for that exists — `demo-as-documentation`: *"It appears where there was a real decision and is absent otherwise … where an ADR answers the question the section links it rather than retelling it. Where there is nothing to explain, there is no section."* It stands in a delivered spec under `.scratch/`, which is the one place a person editing the demo will not look.

- **The criterion moves into `CONTEXT.md`**, under **Page**, as two sentences: when a page has the section, and that a section which is always present stops carrying information. That entry already governs what a page is; this is the part of it that was written down elsewhere.
- **Charts gets its first texts**, and only where a decision already exists to point at: `LimitLine`/`LimitBand` (ADR-0006 — the limit model in both packages, and the conformance test that holds them together), `ControlChart` (ADR-0008 — a control limit is not a specification limit), `StateBand` (ADR-0007 — a state is a number), `Bar` (ADR-0002 — bars on a numeric x axis), `Chart` (ADR-0001 — every scale is affine, and why the draw loop may rely on it). Each links its ADR instead of retelling it, in the voice of `packages/core/demo/why/stat.tsx`, which does exactly that.
- **No filler anywhere else.** Pages without a decision behind them keep no section, in all three demos. This ticket adds five texts, not thirty.

## Acceptance

- `CONTEXT.md`, **Page**, states when a page carries the section.
- `packages/charts/demo/why/` holds five files, each linking its ADR by path.
- No page in any of the three demos gained an empty or generic section.
