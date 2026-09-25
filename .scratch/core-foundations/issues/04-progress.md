# 04 - ProgressBar

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F4; glossary entry **Progress**.

## Acceptance

- Determinate and indeterminate, `aria-valuenow`/`valuetext`; screenshots.

## Comments

Delivered as `ProgressBar` (`src/components/ProgressBar`): determinate (`value` 0 to 1, `aria-valuenow` in per cent, `valueText` for a count) or indeterminate (no value attributes, a sweep on the new token `--u-duration-sweep`, slowed not stopped under reduced motion). No tone. Wording `progress` in English and German; glossary **Progress** in CONTEXT.md. Tests: `tests-unit/progressBar.test.tsx`. Note for 07: with animations disabled the indeterminate bar is photographed at its start and looks like a determinate 30 %.
