# Alarm management: priorities, acknowledge-all, wording, sound, time and shortcuts

Type:   grilling
Status: open

## Question

Decisions 3 to 7 of `.scratch/alarm-management/requirements.md` part B, plus point B.5:

3. Priority levels: four fixed named levels (recommended), or a type parameter for 3 or 4? A non-annunciated
   "journal" level now or later?
4. Which rows does "acknowledge all" take: the selection, else the rows rendered in the viewport, never rows
   that arrived after the confirmation opened (A6.2)? Or the filtered set?
5. ISA words in the English and German wording ("shelved", "out of service"), general names in the API -
   a partial reversal of ADR-0035 for this audience, and a migration of the 35 old keys.
6. Sound only as a callback (`onAnnunciate`), never audio inside the library?
7. Time only as an `asOf` the host ticks, no timer inside?
- B.5: single-key shortcuts (`A`, `S`) meet WCAG 2.1.4 only while the list has focus or when they can be
  turned off or remapped - which promise, and if remappable, which API?

Each answer is small; together they fix the model's surface for the spec.

From "ISA-18.2 and EEMUA 191 in secondary sources": the non-annunciated level is called "diagnostic" in every
source, never "journal"; a fourth level is a rare "highest" (under 1 % of alarms); "acknowledge only the rows
shown" and a 1-2 Hz flash have no source, so they stand as umriss's own rules if kept.
