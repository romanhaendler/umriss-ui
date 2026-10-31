# 02: The field contract - core's demos, docs and tests on the new names

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, decision 1. A migrate batch of the wide rename begun in 01.

**What to build:** nothing in core speaks the old names any more, so a reader copying from core's README,
`llms-full.md` or a demo page writes `onValueChange`/`onCheckedChange`.

- [ ] Core's demos, README (principle 2 loses its exception list: every field is controlled and uncontrolled), the doc comments behind `API.md` and `llms-full.md` use the new names.
- [ ] Core's own tests that call the deprecated name move to the new one - the sanctioned exception to "do not edit an existing test": the assertion stays, only the prop name changes. A test asserting the deprecation itself stays.
- [ ] `grep` finds no deprecated call left in `packages/core` outside that test.
- [ ] `pnpm check core`, `pnpm check:site`; one demo page per field looked at.

## Comments
