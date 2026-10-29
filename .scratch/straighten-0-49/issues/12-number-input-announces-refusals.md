# 12: A NumberInput says why it refused a character

**What to build:** A user who types a letter into a NumberInput hears and sees why nothing happened: the field keeps its text and value (0.49.0), announces once, politely, through core's live-region announcer ("Only digits and the decimal separator", English and German wording), and marks itself invalid for a moment. No new prop. Spec: `../spec.md` ("NumberInput refusal").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Component test: a refused letter announces once and sets the invalid state briefly; a readable key announces nothing
- [ ] Wording in English and German
- [ ] Commit body `Changelog core Added:` / `Fixed:` line
