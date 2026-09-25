# 03 - Reaching transports

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

S2's transport keys, after a throwaway prototype shown to the user rendered.

## Acceptance

- The prototype's decision recorded in the spec; interaction test.

## Comments

Prototype built on the demo's first schedule and judged by the agent (the user was asleep): `]` from a subtask onto the transport that leaves it, `]` again to the stop it reaches, `[` back - so a task's route is walked stop, line, stop. An active transport is drawn as the hovered one (emphasised, dashed where late) with its tooltip; screenshots in `review/after-active-transport-schedule-{light,dark}.png` beside `before-*` and `after-active-subtask-*` for ticket 06.

Decision: **keep `]`/`[`**. Considered against `t`/`Shift+T` (mnemonic in English and German, no AltGr): the brackets are a symmetric pair that says its direction, and the one real weakness - on a German layout they are AltGr+8/9 (Option+5/6 on a Mac), which arrive with Ctrl and Alt set - is closed by matching the CHARACTER whatever the Ctrl/Alt modifiers (`sceneKeys.ts`, tested with ctrl+alt). Of several transports leaving one subtask the first listed is taken (`ponytail:` note in `walk.ts`). Arrows from a transport walk on from its first stop. Interaction test in `features-keyboard.spec.ts`.
