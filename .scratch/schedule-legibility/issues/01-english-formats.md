# 01 — English formats, German optional

Status: ready-for-agent
Type: task

Spec: `.scratch/schedule-legibility/spec.md` (user stories 32–36, "The formats")

## Scope

- `DEFAULT_FORMATS` becomes `en-GB` (24-hour clock); `GERMAN_FORMATS` ships behind the subpath that carries `GERMAN_WORDING`.
- The collation follows the locale; the four demos show the English default.
- An ADR records the decision and points at ADR-0019, which left it open.

## Acceptance

- The formats' characterisation test pins both sets against one fixed instant.
- Every picture that shows a date or a number is renewed **with its count read and stated** - the only ticket allowed to do that in bulk.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, the browser suites green.

## Comments
