# 01 - The reason in the sentence

Status: done
Type: task
Size: S (four source files and their tests)

Blocked by: none
Spec: `.scratch/alarm-snooze-reason-shown/spec.md`

## What to build

The snoozed alarm's sentence carries the stored reason.

- `packages/core/src/lib/language/wording.ts`: `availabilitySnoozed: (until: string, by: string, reason?: string) => string`; its doc comment (l.447-449) says the reason comes last and is optional. The English body (l.869) appends `: ${reason}` for a non-empty reason.
- `packages/core/src/lib/language/de.ts` (l.298): the same in German.
- `packages/table/src/alarms/AlarmList.tsx`, `availabilityWords` (l.164-174): pass `snooze.reason?.trim() || undefined` as the third argument. Nothing changes at l.430-438: the badge reads `short`, the tip and the hidden text read `full`.
- `packages/table/src/alarms/alarmModel.ts` (l.122): the comment on `Snooze.reason` no longer says the list does not show it.
- Example 08 of the AlarmList page, the AlarmList's props documentation and the snooze spec's last paragraph ("Stored, not shown") get a line saying it is shown now.

## Acceptance

- [ ] A snoozed alarm with a reason: tooltip and screen-reader text end in the reason, English and German.
- [ ] Without a reason, or with only blanks: the sentence is exactly what it was.
- [ ] The badge still reads one word.
- [ ] A hand-written two-parameter `availabilitySnoozed` is accepted by the provider's type (type test) and the list works with it.
- [ ] The comment in `alarmModel.ts` is true.
- [ ] Changelogs: core and table under "Added" ("a snooze's reason is shown in the tip and spoken"); schedule and calculation follow the release rule (a new word in core takes them along).
- [ ] Generated documents pass their guards; typecheck and unit tests pass.

## Comments

Delivered.

- `availabilitySnoozed(until, by, reason?)` in `wording.ts` and `de.ts`: `: ${reason}` appended for a non-empty reason, "Snoozed until 12:00 by M. Keller: valve" / "Zurückgestellt bis 12:00 von M. Keller: Ventil". `AlarmList` passes `snooze.reason?.trim() || undefined`; the badge still reads `short`. `Snooze.reason`'s comment, the `onSnooze` prop doc, example 08's lead, the AlarmList outline paragraph and the snooze spec's "Stored, not shown" paragraph say it is shown now.
- Tests: `alarmList.test.tsx` (tip and spoken sentence, trimmed, blank, German, a two-parameter wording through the provider - which the typecheck also holds), `core/tests-unit/language.test.tsx` (both languages, with and without; a two-parameter `Partial<Wording>` assignment).
- Changelogs: core and table under Unreleased/Added. Schedule and calculation take the release rule at the release, which is not done here.
