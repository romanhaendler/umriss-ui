# P1 Lena (beginner) - 2026-10-28, 0.48.0
Host: p1-beginner/app (Vite 8.3.5 JS template, React 19.3; core/table/schedule). Rerun: `node run.mjs http://localhost:4340 <case>` or `node full.mjs <case>`.
Not covered: WebKit, jest/vitest, SSR, alarms/dashboard/calculation, stale stored dashboard.

Findings (unverified until marked ✓):
1. Trap: schedule README order (Dependencies before Subtasks) gives a FALSE warning "dependency d names subtask s1, no subtask has that id; left out" - dependency is drawn. Case s-dep-ok-before vs s-dep-ok-after. Idea: check ids after all layers registered.
2. Trap: useTable without rowKey, or rowKey:"id" string -> white screen "undefined is not a function". Still there from last run. Cases t-norowkey, t-rowkey-str.
3. Trap: wrong types crash with raw messages: DatePicker value string (getTime), MultiSelect value "a" (filter), schedule domain Dates/string, subs object. Still there.
4. Trap: silent wrong data - schedule from/to as ISO/Date/seconds -> subtask vanishes; table column with missing field -> "No value"; Stat value "3.42" -> "No value"; Select/Combobox/MultiSelect with string options -> empty (MultiSelect key error); NumberInput value "12" silently ok.
5. Trap: unknown props copied to DOM (Input label -> <input label>, Select options -> attr); Button varient/primry/size=large fall back silently; intents="move" string / intents without onIntent no hint.
6. Trap: NumberInput onChange gets a value not event; e.target.value throws. Still there.
7. Trap: <Modal open> without onClose: Escape closes, then "n is not a function" thrown, open stays true. Still there.
8. Trap: missing charts peer for schedule -> Vite 500 (pnpm only; npm auto-installs). documented.
9. Misfit: table without aria-label no accessible name, no warning; Dates in table "04/03/2024, 00:00", numbers unformatted; schedule 2 lanes above ~250 px empty plot at 375.
10. Look: without color-scheme set by app, dark never switches. documented table README, not in snippets.

Wish: a dev validation mode - one warning per trap naming prop and expected type (already in wishes.md as DEV warnings).
Improved since last run: table rows as object warns; rows undefined/null shows "No entries"; pageSize without Pagination warns; schedule warns on end<start, unknown lane/task, dup id; dev warnings fire in Vite (fixed).
Held up: README snippets first try, no provider/CSS import; prod build works without cssTarget; 375 px table scrolls in own frame.

Verified by coordinator: 1 ✓ (sceneData.ts:189-191 unknown-end check lacks the "still registering" exemption the lane check has at :192), 7 ✓ (onClose required in types; JS-only trap).
