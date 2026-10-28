# P4 Jonas (vibe coder) - 2026-10-28, 0.48.0
Host: p4-vibe-coder (Vite 8.3.5, React 19, TS strict; core/table/charts/alarms/dashboard). 7 of 10 requests clean first time.
Not covered: WebKit, real touch, schedule/calculation, SSR, tests.

Findings (unverified until marked ✓):
1. Trap: dark set from JS (`style={{colorScheme}}`, llms-full Theming ~l.3057) is light again in a production build; caveat only in core README Styles, not llms-full. Red: prod.mjs, shots/prod-dark-login.png. Known light-dark lowering, still there for JS-set mode.
2. Trap: `autoFocus` on a field inside Modal ignored, focus lands on Close (X). No initial-focus prop. Red: focus.mjs -> "BUTTON Close". Guess: autoFocus fires before showModal().
3. Trap: UmrissProvider language={German} does not reach charts (axis "Dec 2025", legend). documented ADR-0031.
4. Look: dashboard cards inset 16 px from siblings' edge (dashboard.module.css:20 `.root { padding: 0 var(--u-space-4) var(--u-space-4) }`).
5. Misfit: two widgets of one type both announced "Actions for Figure".
6. Trap: dangling README links in installed packages - alarms README -> API.md, ../../docs/standards.md; charts README -> docs/capabilities.md (not shipped).

Wishes: language provider shared by charts (unlisted, ADR-0031); initial-focus on Modal/Drawer (unlisted; MUI autoFocus, Radix onOpenAutoFocus).
Held up: typecheck first time, no console warnings; RowActions row menu; Modal->toast Undo, focus return; Ctrl+K; German in table/alarms/dashboard; Drawer via matchMedia no overflow at 375; dashboard keyboard move announced; alarm list both themes.

Verified by coordinator: 2 ✓ (Modal.tsx showModal in effect via dialogChoreography.ts:90; React autoFocus writes no attribute, dialog focusing steps take first tab stop = Close), 4 ✓ (dashboard.module.css:20), 6 ✓ (files field ships only dist, llms-full, CHANGELOG; links at alarms README:37,42, charts README:154,225).
