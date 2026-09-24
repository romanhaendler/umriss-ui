# 01 - The charts' wording

Status: done
Type: task

Spec: `.scratch/charts-a11y/spec.md` - Q7, ADR-0031.

## Scope

- `ChartsWording` (typed, every entry named after what it labels) with
  `DEFAULT_CHARTS_WORDING` in English, exported from the main entry.
- `GERMAN_CHARTS_WORDING` behind `@umriss-ui/charts/wording/de`: package
  `exports`, a second build entry, types.
- `Chart` takes `wording?: Partial<ChartsWording>`; missing entries fall back
  to English; the existing string props (`empty` and its kin) keep winning.
- The entries 02 and 03 need: role description, summary sentences, the
  readout sentence, key help. (Delivered so; "no value" and a series position
  were dropped - a gap is never a hit, and the readout names the series.)

## Acceptance

- Both registers are typed `ChartsWording`; a missing entry fails `tsc`.
- An app importing only the main entry does not bundle the German register.
- Unit test: a partial wording falls back entry by entry.
