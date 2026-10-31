# 20: Table export and copy write what the screen shows

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: README 23, 24; P28 6 (NaN); earlier-runs-open table.md 10, export 1-5, 8. Reds: H8 `t7.mjs`,
`t12.mjs`; P28 "csv".
All reds named here are in `../reds/` (`../reds/README.md`).

- [ ] A grouped table exports its rows in the groups' order (and folded groups' rows too), as `llms-full.md:540` promises; group header lines in CSV are decided in the ticket and documented.
- [ ] A date column's export format follows the column (`format`), not whether the exported rows happen to be at midnight - CSV and XLSX alike.
- [ ] CSV writes NaN and ±Infinity as empty like everywhere else, and numbers without float noise or `1e+21` (the number's shortest round-trip form in plain notation).
- [ ] A visible column of kind "other" without `exportValue` warns in DEV instead of vanishing silently; a mixed column is judged by its declared kind, not its first value; a column without label exports a readable header (or warns).
- [ ] A tree search exports ancestors with their level; `selectionAsText` carries the level column for trees.
- [ ] `toggleColumn` on a row-header column leaves it out of `hidden`.
- [ ] The H8 oracle cases rerun green; `pnpm check table`.

## Comments
