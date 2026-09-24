# 06 — Motion that explains the grouping

Status: ready-for-agent
Type: task

Blocked by: 04
Spec: `.scratch/table-grouping/spec.md` ("Motion — Q13")

## Scope

- FLIP on grouping and ungrouping (`--u-duration-medium`, `--u-ease-out`).
- Animated fold height, content kept in the DOM and inert while folded.
- Stacked sticky bands handing over; the shadow step only while content lies
  beneath.
- Groups emptying under a filter leave animated; header counts count to their
  new value.
- Tree guides at three levels.
- Everything off under `prefers-reduced-motion` through the duration tokens.

## Acceptance

- No layout shift outside the animated rows (checked in the browser at 1×
  and with throttled CPU); a virtualised table does not animate rows outside the
  window.
- Reduced motion: the end state appears at once.
