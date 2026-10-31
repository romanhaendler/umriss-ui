# 14: Core's docs and types

Status:     ready-for-agent
Blocked by: 04, 05

Sources: earlier-runs-open core B11 rest, core C (asOf, README form), agent-docs 5, design-system 7, P12-1.

- [ ] `Tooltip.children` and `Menu.trigger` are typed so that a ref and the needed props are checked (today `ReactElement<Record<string, unknown>>`).
- [ ] An ISO string as `asOf` warns in DEV (today it reads "No connection" silently).
- [ ] Core's README has a form example (native form with action and one form library, the contract of 01, 04 and 05).
- [ ] llms-full's scenarios that import charts or table say to install them.
- [ ] Charts docs: `encoding="marks"` is named as the route when colour alone is not enough.
- [ ] `pnpm check core`, `pnpm check:site`.

## Comments
