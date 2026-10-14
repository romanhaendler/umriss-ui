# 01 - The toast's width is a token

Status: done
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/toasts-held/spec.md`, Implementation Decisions ("The width
token", "What the application computes is its own"); user stories 39-42, 45

## What to build

An application reads the toast's width from a token instead of copying the
number, and may set it. `--u-toast-width: 360px` stands on `:root` in the token
group of the toasts, a plain length so that its computed value is a number. The
region reads it where it reads `360px` today. Below 600 px nothing changes: the
toast keeps the window's width minus the side tokens.

## Acceptance

- [x] `--u-toast-width` with the default `360px` in the toasts' token group;
      the region's width reads it; no literal width is left for the toast.
- [x] The Theming page names it beside the four distance tokens.
- [x] Browser test: the token set to another length, the card takes it at
      1280 px and ignores it at a phone's width.
- [x] Without the token set, every existing toast picture is unchanged.
- [x] `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`.

## Comments

2026-10-14: Built as written. The Theming page names the token through its
token table, which is derived from `tokens.css` (the row stands right below
the four distance tokens); the prose of the "customising" section in
`demo/outline.ts` was left as it is, so no page picture moved. The browser
test polls the card's width, since the entrance scales the card up to it.
Checks: `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`
green; the toast and Theming pictures in both themes unchanged (40 passed).
