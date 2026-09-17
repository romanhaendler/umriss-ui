# 02 — Wheel, zoom and auto-pan

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 9–16, "Wheel", "Auto-pan during a drag")

## Scope

- The plain wheel scrolls the lanes and releases the page at their end; Ctrl/⌘ and pinch zoom; horizontal or Shift pans.
- Auto-pan in an edge zone during every drag, speed from a pure function; the ghost follows.

## Acceptance

- `autoPan.test.ts`; browser tests for wheel scrolling and page release, Ctrl-wheel zoom, auto-pan during a move; existing wheel tests updated to the new gesture.

## Comments
