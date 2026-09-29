# 03 — Demo: a page "Metrics"

Status: done
Type: task

Blocked by: 02
Spec: "Testing Decisions"; user stories 1–8

## Scope

A new page "Metrics" under "Writing a calculation", with its outline entry
(sentence, about, limits, alternatives), and examples from simple to large.
Every one uses real staff numbers, never `a + b`:

1. First steps: two teams, headcount and FTE, one sum.
2. What can go wrong: an FTE figure not recorded (absent in one metric only),
   and the development errors (a missing key, a `Product` with metrics) shown
   as the messages they throw.
3. Tree: team → area → business line.
4. Chain: staff movement over a quarter (opening stock, joiners, leavers,
   parental leave, closing stock).
5. Three metrics: headcount, FTE, monthly staff cost.
6. The large case: a whole company from data, `.map` over three levels.

## Acceptance

- Screenshot baselines for the new page, light and dark, phone and laptop, each
  looked at. axe clean on the page.
- The prerendered HTML and `llms.txt` carry the page (ADR-0037).
- `pnpm lint`, `pnpm typecheck`, the package's tests and visual tests green.

## Comments

Delivered: the page and six examples in the order asked, on the planning world (Tidewell) and the controlling world, which gained `TEAMS` and `BUSINESS_LINES`. **Deviation:** the development errors are not shown as thrown messages. No demo has an error boundary, and a caught render error is logged to every visitor's console; the messages stand in the page's limits and, verbatim, in the unit tests.
