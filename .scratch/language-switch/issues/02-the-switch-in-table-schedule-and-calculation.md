# 02: The switch in table, schedule and calculation; charts explains its absence

Status: ready-for-agent
Blocked by: 01 (EN/DE switch in the core demo)
Spec: `.scratch/language-switch/spec.md`

**What to build:** The table, schedule and calculation demos pass the switch option. German carries across demos, because they share one origin and one stored setting.

The charts demo shows no switch. Its Installation page gains one sentence: the charts take German per chart through the `wording` prop from the charts' German subpath, and the keyboard and screen reader example shows it.

- [ ] With DE on, the table's empty state, the schedule's readout and a calculation's library text render in German, with German dates and numbers.
- [ ] German chosen in core is still on after moving to the table demo.
- [ ] The charts demo shows no switch (asserted in the shell suite), and its Installation page carries the sentence.
- [ ] Shell suite probes per demo are green; no baseline changed.
