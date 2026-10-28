# P3 Petra (staff engineer) - 2026-10-28, 0.48.0
Host: p3-staff-engineer (Vite 8.3.5, React 19.3.1, TS 7.0.2, Playwright 1.64.1 Chromium, axe; all seven tarballs, cssTarget set).
Not covered: WebKit, SSR, real dark mode (page never set color-scheme), 10k options / 5k tree nodes, dashboard edit/drag, AlarmList snooze dialogs, Jest/Vitest.

Findings (unverified until ✓):
1. Misfit: AlarmList not virtualised, no paging: 5k alarms -> 96,826 nodes, 2.4 s first paint (1k: 19k nodes, 0.49 s); 100k virtual Table 126 ms, 188 nodes. node scale1.mjs 10 5000. README "Known limits" only "does not sort, does not page". Reach: flood = ADR-0078's own case.
2. Misfit: AlarmList caller aria-label lands on role-less root div (AlarmList.tsx:522); inner table always "Alarms" from wording; two lists both "Alarms". ADR-0068 shape-3 routing not applied.
3. Look: DatePicker placeholder "Select date" rgb(139,139,139) on white ~3.4:1 (axe color-contrast serious, ._value_). Input placeholder not flagged.
4. Misfit: Schedule puts caller aria-label on figure AND plot - two elements same name. ADR-0068 says figure and plot.
5. Misfit: upgrade risk - md 32->44 (0.43)->32 (0.48); Dock removed, tree transition exports, alarm wording keys removed, one minor each, no deprecation; rename keeps old name one minor. documented ADR-0066 + Migration lines.

Wish: virtual/windowed AlarmList (unlisted; AG Grid row virtualisation, TanStack Virtual).
Held up: root contract same on all 7 packages; fields route testid/id/aria-label to control; ariaLabel is TS error with did-you-mean; scrollToRow/focusCell/scrollToLane etc compile and work; virtual table without bound dev warning; 100k rows 126 ms; AlarmList keyboard (one tab stop, a acks, Shift+A); axe clean in light; AlarmBanner region + hidden alert, AlarmList polite live region; strict-clean on TS 7 skipLibCheck false.

Verified by coordinator: 1 ✓ (AlarmList.tsx:294 useTable without virtual, :520 Table without virtual - the table can window but the list does not pass it), 2 ✓ (AlarmList.tsx:522 Table aria-label={wording.alarmList} hard-coded).
