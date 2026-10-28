# Changes to `@umriss-ui/alarms`

This document describes what changes for **callers** of the package: exports,
props, behaviour.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. The seven packages are released in step, and a rename
keeps its old name for one further minor, with a warning, before the minor after
it removes the name ([the upgrade promise, ADR-0066](../../docs/adr/0066-one-number-peers-over-the-minor-a-rename-lives-one-minor.md)).
**Whatever changes existing behaviour stands under a heading "Changed" of its
own**, no matter which digit rose, with a `Migration:` line.

Alarms joins the other six packages' one number at its first version.

## 0.49.0 – The second shakedown: lists that shrink, a flood that scrolls, five things the table lacked (Oct. 2026)

### Changed

- **AlarmList's `aria-label` and `aria-labelledby` name its grid**, not the role-less root; two lists on one screen read their own names, and the wording's "Alarms" stays the default.
  - Migration: nothing to change in an application; a test that read the name off the root reads it from the grid (role "grid").
- **Under `touch-scale.css` Acknowledge, Shelve and Unshelve are 44 px** with core's `sm` controls.
  - Migration: to keep them at 26 px under the opt-in, set `--u-control-height-sm` after the import (see core's changelog).

### Fixed

- **An AlarmList with a `maxHeight` renders only the rows in view**: a flood of thousands of standing alarms no longer costs seconds and 100,000 nodes; Shift+A and S still reach the whole list. Without a `maxHeight` every row is rendered, as before.
- **A lifecycle state wider than its cell** ends in an ellipsis with the full text as its title.
- **The AlarmBanner's time** no longer wraps its "AM" at 375 px.
- **README links resolve on npm**: links to files the package does not ship point to the repository on GitHub.

## 0.48.0 – Released in step with core (Oct. 2026)

No change of its own; the number moves with core's touch scale, now an opt-in (ADR-0079): a `md` control of core stays 32 px under a finger unless the application imports `@umriss-ui/core/touch-scale.css`.

## 0.47.1 – Released in step with the table (Oct. 2026)

No change of its own; the number moves with the table's repaired exports.

## 0.47.0 – Alarm management: a model, a list and a banner (Oct. 2026)

### Added

- **`alarmModel`**, the lifecycle of the application's alarms as a pure view: four priorities (`critical`, `high`, `medium`, `low`), acknowledgement, shelving with the plant's reasons, suppression by design and out of service, flood and chatter. `Alarm.group` and `Alarm.sequence` give the first-out alarm of each group (`AlarmRow.firstOut`), `Flood.first` the earliest of a flood, `AlarmProjection.rate` the alarms raised in the ten minutes before the as-of time and `unacknowledgedByPriority` the count per priority. `acknowledge`, `lifecycleAt` and `countAcknowledgeable` are the transitions and counts the application applies; the package generates no alarm.
- **`AlarmList`**, a grid with one tab stop, worst first: `PriorityMark`, "First out" and "First in flood" badges, the Raised column to the second, `maxHeight` for a scroll area, a ref on its root, and `snoozeReasons` (with `snoozeReason="required"` one reason must be given). A acknowledges the focused alarm, Shift+A asks to acknowledge the selection or, without one, the rows in view, S opens the shelve panel. A shelved alarm still in alarm shows "Shelved until 14:05". The live region changes at most once per two seconds of the view's as-of time and says a count of 0 when no row is shown. The flood mark reads "Alarm flood: 40 in 10 min".
- **`AlarmBanner`**: the worst active, unacknowledged alarm in service with its mark, label and time, the count per priority, "n more", the flood and the freshness; `onAcknowledge`, `onOpen` and `onAnnunciate` (`new` with the highest priority, `cleared`), the cue for the application's horn. Its alert text carries the alarm's raised time, so a second arrival of the same type is spoken again; a consumer's `aria-label` is kept.
- **The demo** on port 4179: example pages and the scenario "Work through the alerts". What the package follows of ISA-18.2 and where it departs stands in `docs/standards.md`; no conformance is claimed.
