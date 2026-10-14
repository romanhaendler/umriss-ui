# 01 - The toast's width is a token

Status: ready-for-agent
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

- [ ] `--u-toast-width` with the default `360px` in the toasts' token group;
      the region's width reads it; no literal width is left for the toast.
- [ ] The Theming page names it beside the four distance tokens.
- [ ] Browser test: the token set to another length, the card takes it at
      1280 px and ignores it at a phone's width.
- [ ] Without the token set, every existing toast picture is unchanged.
- [ ] `pnpm check core`, `pnpm check:site`, `pnpm test:visual:quick core`.
