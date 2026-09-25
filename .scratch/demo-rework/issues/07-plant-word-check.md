# 07 - The plant-word check

Status: ready-for-agent
Type: task
Blocked by: 03, 04, 05, 06

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

A check (beside the existing demo checks) that flags plant words (plant, machine, shift, operator, pump, kiln …) in package sources and demos outside the plant world; an allowlist for the plant world and for ISA references in `docs/standards.md`. Also counts each package's plant examples against the quarter limit.

## Acceptance

- Runs in CI with the other checks; fails with file and word.
- Its own unit test with a good and a bad fixture.
