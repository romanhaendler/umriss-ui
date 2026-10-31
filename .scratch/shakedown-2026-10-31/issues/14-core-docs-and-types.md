# 14: Core's docs and types

Status:     done
Blocked by: 04, 05

Sources: earlier-runs-open core B11 rest, core C (asOf, README form), agent-docs 5, design-system 7, P12-1.

- [x] `Tooltip.children` and `Menu.trigger` are typed so that a ref and the needed props are checked (today `ReactElement<Record<string, unknown>>`).
- [x] An ISO string as `asOf` warns in DEV (today it reads "No connection" silently).
- [x] Core's README has a form example (native form with action and one form library, the contract of 01, 04 and 05).
- [x] llms-full's scenarios that import charts or table say to install them.
- [x] Charts docs: `encoding="marks"` is named as the route when colour alone is not enough.
- [x] `pnpm check core`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** Tooltip `children` and Menu `trigger` typed as elements that
take a ref and the ARIA props; Stat warns once in DEV for a string `asOf`; core README "Forms" (native
`<form action>` and react-hook-form with `Controller`/`register`); llms-full scenarios carry their
`npm install` line (from `builtFrom`); charts README names `encoding="marks"`. Decided: the element type
stays inline in both files (the props generator rejects an unexported shared type); the react-hook-form
snippet is illustrative, not compiled (no dependency).
