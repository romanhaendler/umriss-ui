# 12: Tokens and looks - muted contrast, rings, gaps, touch

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: README 37; earlier-runs-open core B5, qa 4c, charts 3, dashboard 8, design-system 9, zoom 3, zoom 6,
settle 9b, settle 11.

- [ ] `--u-color-text-muted` reaches 4.5:1 on every surface it stands on, light and dark (`core/src/styles/tokens.css:40`); `core/tests-unit/contrast.test.ts` drops its 3:1 exception; the TextTone doc's promise holds. One fix closes the FormField hint, placeholders, weekday heads, chart "Show data", dashboard size label.
- [ ] The skip link shows the library's focus ring.
- [ ] Stacked FormFields have a gap: an error never touches the next label.
- [ ] Tokens for the values that have none: the button's disabled opacity, the virtual row's focus ring (today `--u-color-accent`), the charts' shadow literal.
- [ ] Controls carry `touch-action: manipulation` (no double-tap zoom on steppers and calendar days); on touch, field text follows a raised root size instead of staying 16 px.
- [ ] `stylesheets.test.ts` (scans every package's CSS) passes; every screenshot that changes looked at; `pnpm check core`.

## Comments
