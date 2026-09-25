# 01 - The shell: lede, about, lead, known limits, keyboard, scenarios page

Status: ready-for-agent
Type: task
Blocked by: —

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

`packages/demo`: the component page skeleton of the spec (lede, optional about, import line, first example without heading, examples with a visible `lead` exported beside `title`, When to use something else, Keyboard, API with events apart, Known limits); the `why/` mechanism removed; a scenarios page (job title, who-uses sentence, live screen, numbered callouts, Built from, code) as the first page of every demo. The "demonstration" form goes: `fileName.ts`, `examples.ts`, `Example.tsx`, `page.css`, `llms.ts`, `checks/ownData.ts` and their tests.

## Acceptance

- Unit tests for `lead` and the scenarios page in the tooling and in llms output.
- No "demonstration" left in live code or tests (`docs/journal.md` and the archive stay as history).
- Existing pages still render; content changes wait for the page tickets.
