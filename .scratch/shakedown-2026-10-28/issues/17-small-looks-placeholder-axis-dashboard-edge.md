# 17: Smaller looks - the DatePicker placeholder, the value axis, the dashboard's edge

**What to build:** Three small looks, each reproduced first: the DatePicker's "Select date" placeholder uses the muted-text token that reaches 4.5:1 (axe reports about 3.4:1); a bar or column chart's value axis ends on the next nice step above the largest value, so bars do not touch the top; the dashboard's cards are flush with a table or chart above them while not editing (today the root's side padding puts them 16 px inside), and keep their room for the edit outline in edit mode. Spec: `../spec.md` ("Smaller looks"); repros: `../personas/p3-petra.md` 3, `../personas/p16-migration.md` 6, `../personas/p4-jonas.md` 4.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Each finding reproduced first; one that does not reproduce is reported, not changed
- [ ] axe reports no contrast issue on an empty DatePicker in light and dark
- [ ] A test: a bar chart whose maximum is a round number has an axis maximum above it
- [ ] A browser test: the dashboard's first card starts at the same x as a table above it while not editing; in edit mode the outline is not clipped
- [ ] Visual baselines that move are reviewed one by one
- [ ] Commit body: `Changelog core` / `charts` / `dashboard Fixed:` lines
