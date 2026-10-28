# P6 Sven (operator screens) - 2026-10-28, 0.48.0
Host: p6-operator (Vite 8, cssTarget chrome123, React 19, TS; core/table/alarms; ?touch loads touch-scale.css; P1 / trip 40 / flood 500 buttons, 1 s asOf tick). Chromium only.
Not covered: WebKit, German, CSV/journal view, multi-day soak, PriorityMark alone.

Findings (unverified until ✓):
1. Misfit: every alarm button hardcoded size="sm" -> touch-scale.css never reaches them; banner Ack/Open list and list Ack/Shelve/Unshelve stay 26 px under coarse pointer, rows 35 px, no hit pad. AlarmBanner.tsx:116,121; AlarmList.tsx:181,436,445,461,503. node probe6.mjs. ADR-0079 "containers grow from the token" not met for alarms.
2. Misfit: list not virtual - 1000 alarms 30,206 nodes; 5000 -> 150,206 nodes, ~2.4 s. Requirements A6/A8 asked virtual rows at flood volume. (= P3 finding 1)
3. Look: banner too quiet for across-the-room: normal strip, no priority colour band, mark 20 px; flood = same strip + small badge. shots/p1.png, flood.png, wall-4k-root32.png. Idea: size / annunciator variant.
4. Look: wall 3840x2160 at root 32 px: banner/list buttons 26 px high, 22 px text. Known operator-screens.md item 2, still there.
5. Misfit: Playwright uncheck() on core Switch times out (_track intercepts). Known core-screens.md item 1, still there.
6. Look: 375 px Priority column off-screen right, no priority mark visible on phone.

Wishes: horn with silence + audible repeat (not yet - README "horn is yours"); latched alarms + statistics view top-N/stale (not yet - Known limits).
Held up: build/types/console clean; four lifecycle states; shelve with required reason, "Shelved until 20:46 by sven: Maintenance"; new P1 changes only banner, role=alert speaks once, onAnnunciate new+cleared; list live region one number throttled; stale/no-connection after 10/30 s, alarms stay; focus stays on same alarm on re-sort; keyboard A, Shift+A confirm, S shelve, Escape; first-out exactly one row, "First in flood", "Alarm flood: 502 in 10 min"; flash 1 Hz, 0 under reduced motion; shapes + numbers; dark correct; 375 no overflow; touch-scale.css sets --u-control-height 44 under coarse only.

Verified by coordinator: 1 ✓ (all 7 alarm Buttons size="sm"; ADR-0079 l.9/61 keeps sm fixed on purpose - so the decision holds, the question is whether alarms should be built on sm), 2 ✓ (see p3-petra 1).
