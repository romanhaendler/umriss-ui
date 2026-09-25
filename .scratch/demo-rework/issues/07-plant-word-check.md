# 07 - The plant-word check

Status: done
Type: task
Blocked by: 03, 04, 05, 06

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

A check (beside the existing demo checks) that flags plant words (plant, machine, shift, operator, pump, kiln …) in package sources and demos outside the plant world; an allowlist for the plant world and for ISA references in `docs/standards.md`. Also counts each package's plant examples against the quarter limit.

## Acceptance

- Runs in CI with the other checks; fails with file and word.
- Its own unit test with a good and a bad fixture.

## Comments

2026-09-25, delivered on `main`. `packages/demo/checks/plantWords.ts` with its fixture test; the repo run is a unit test (`plantWords.repo.test.ts`), so CI holds it; counts the plant quarter and plant scenarios. "operator" is left out on purpose (the calculation's arithmetic operator), recorded in the check's head. Visual baselines wait on the branch `demo-rework-baselines` for ticket 30's review (CONTEXT.md, Baseline).
