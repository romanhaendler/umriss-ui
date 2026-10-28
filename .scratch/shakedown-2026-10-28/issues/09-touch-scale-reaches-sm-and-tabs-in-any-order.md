# 09: touch-scale.css works in any import order and grows sm controls and Tabs

**What to build:** A field-service app that imports `touch-scale.css` at the top of its entry file gets 44 px controls under a finger; today an import before core does nothing, because both rules sit on `:root` in the same layer and core's CSS arrives later. The opt-in's rule wins whatever the order (a higher specificity, still on `:root` inside the tokens layer, so ADR-0021 holds). Under the opt-in `sm` grows with `md` (both 44 px), so the alarm Acknowledge/Shelve/Unshelve buttons, the table toolbar, pagination and row actions grow; Tabs read the control height like every `md` control. `xs`, menu rows, calendar days, checkboxes, switches and radios keep their size and their 24 px hit areas, and the docs say so. ADR-0079 gets a dated amendment. Core's `llms-full.md` gets a "Touch" section (the opt-in, any order, what does not grow); table's and alarms' docs point to it in one line. Spec: `../spec.md` ("Touch scale"); repros: `../personas/p7-mira.md` 1-4, `../personas/p6-sven.md` 1.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A browser test: `touch-scale.css` imported before and after core gives a 44 px `md` Button under a coarse pointer, 32 px without the opt-in
- [ ] A browser test under the opt-in: the alarm banner's Acknowledge, the table toolbar's Search and Columns, pagination and Tabs measure 44 px; without the opt-in they keep today's heights
- [ ] Checkboxes, switches, menu rows and calendar days keep their size and a hit area of at least 24 × 24
- [ ] ADR-0079 amended; README and `llms-full.md` of core name the opt-in and its limits; table and alarms point to it
- [ ] Visual baselines that move are reviewed one by one before they are updated
- [ ] Commit body: `Changelog core Changed:` with `Migration:`, and `Changelog table` / `alarms Changed:` lines
