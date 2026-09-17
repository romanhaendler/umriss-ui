# 07 — The schedule demo, its demonstration and its browser suites

Status: done
Type: task

Blocked by: 01, 06
Spec: user stories 32, 33 · "Demo" · Testing Decisions

## Scope

- Pages and examples on the shared shell, rubrics decided against the demo
  vocabulary; "Why it is like this" where a decision needs it.
- One demonstration: right-click opens the core `ContextMenu`, intents come
  back as data, `ripple` offered as an action.
- `screenshots.spec.ts`, `features-*.spec.ts`, `accessibility.spec.ts`,
  `own-base.spec.ts`, `features-shell.spec.ts`, `features-page.spec.ts`,
  `pages.ts`, `navigation.ts`.

## Acceptance

- The schedule projects green in Playwright; baselines are new, none of core,
  charts or table moves except the new `ContextMenu` pictures.

## Comments

**Delivered** (39d766b).

- Rubrics: **Drawing** (Schedule, Lane, Subtasks, Transports), **Editing**
  (Intent, ripple), **Findings** (findings) - sixteen examples, one
  demonstration on `Intent`. The plan in `demo/data.ts` holds exactly one
  overlap and one late transport, checked by hand in the demonstration test.
- Suites: screenshots (50 new baselines), features-schedule, features-editing,
  accessibility (four pages, code open, the portalled context menu),
  own-base, features-shell, features-page. 110 passed, twice in a row.
- No "Why it is like this" page yet: the reasons stand in the examples' heads
  and the ADRs.
