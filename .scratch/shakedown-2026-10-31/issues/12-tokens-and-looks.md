# 12: Tokens and looks - muted contrast, rings, gaps, touch

Status:     done
Blocked by: None (can start immediately)

Sources: README 37; earlier-runs-open core B5, qa 4c, charts 3, dashboard 8, design-system 9, zoom 3, zoom 6,
settle 9b, settle 11.

- [x] `--u-color-text-muted` reaches 4.5:1 on every surface it stands on, light and dark (`core/src/styles/tokens.css:40`); `core/tests-unit/contrast.test.ts` drops its 3:1 exception; the TextTone doc's promise holds. One fix closes the FormField hint, placeholders, weekday heads, chart "Show data", dashboard size label.
- [x] The skip link shows the library's focus ring.
- [x] Stacked FormFields have a gap: an error never touches the next label.
- [x] Tokens for the values that have none: the button's disabled opacity, the virtual row's focus ring (today `--u-color-accent`), the charts' shadow literal.
- [x] Controls carry `touch-action: manipulation` (no double-tap zoom on steppers and calendar days); on touch, field text follows a raised root size instead of staying 16 px.
- [x] `stylesheets.test.ts` (scans every package's CSS) passes; every screenshot that changes looked at; `pnpm check core`.

## Comments

**Delivered (2026-10-31, run coordinator).** Muted text `light-dark(#666666, #909096)`, 4.5:1 on every
surface incl. pressed (contrast test without the 3:1 exception); skip link with the library ring;
`--u-button-disabled-opacity`, `--u-focus-row-color`, `--u-shadow-float` (charts keeps a literal fallback,
it does not depend on core); `touch-action: manipulation` on Button, NumberInput stepper, calendar day;
touch field text `max(16px, 1rem)`. Decided: the stacked-field gap is a sibling margin that yields inside
containers with their own gap - Stack and Grid carry `data-umriss-gap` (a plain margin doubled the
configurator's spacing, seen in the screenshot); touch-action only on the controls the finding named.
