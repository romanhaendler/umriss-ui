# 01 — Reading and evaluating metrics

Status: done
Type: task

Blocked by: none
Spec: "API", "Development errors", "Model and evaluation", "Places"; user
stories 3, 6–8

## Scope

- `metrics` on `CalculationProps`, `Metric` exported as a type, and `value` as a
  number or an object by metric on `Given` and the chain's line tags. Props
  documented for the props gate.
- Every development error in the spec, each with a message saying which and
  where.
- Evaluation once per metric over the same model: each given with the metric's
  number, every quantity with the metric's unit and places. Absence, the
  approximation mark and the reason are per metric.

## Acceptance

- Unit tests: the lead case evaluated per metric, the absent FTE figure making
  only FTE totals absent, a chain with `Minus`, the approximation mark in one
  metric only, and one test per error asserting its message.
- The existing unit tests pass unchanged.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.

## Comments

Delivered: `metrics`, `Metric`, `MetricValues`; every error of the spec with a test asserting its message; `perMetric` gives one view of the model per metric, so evaluation needed no change. The missing-key message lists the metric ids (from the review).
