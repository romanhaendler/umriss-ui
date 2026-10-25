# A theme object

Type:   grilling
Status: resolved

## Question

Does umriss offer a theme object beside its tokens?

A design-system persona wrote about 50 lines of tokens and a 10-line provider, and wished for MUI's or
Mantine's `createTheme` (`.scratch/shakedown/design-system.md`, `core.md` B9). ADR-0045 makes the tokens the
styling API.

- A typed object that writes `--u-` and `--uc-` tokens (a provider, or a function that returns CSS), or a
  documented token file to copy?
- Density as two systems (`design-system.md` 3): dense or roomy tokens leave table rows at 36 px - part of
  this, or its own fix?
- The cascade-layer order a wrapper library declares (`design-system.md`, the `@layer` finding) - documented
  here?

The three missing tokens (modal width, text-transform, press scale) are decided by ADR-0045 and go straight to
`/to-spec` (see the map's Notes).

## Answer

Decided 2026-10-25 by the maintainer.

- **No theme object** (no `createTheme`, no theme provider). ADR-0045 holds: the tokens are the styling API,
  and a second way to the same tokens would need its own types, docs and tests.
- **Instead a documented, complete token file to copy:** every colour token a brand changes (the six accent
  tokens of `core.md` B9 and their dark values, and the charts' `--uc-` palette), in core's README, replacing
  the example that sets only `--u-color-accent`.
- **The cascade-layer order** a host or wrapper library declares (Tailwind v4, `core.md` B7) is documented in
  the same section.
- **Density:** table rows that stay at 36 px under the dense and roomy tokens are a defect, fixed so the rows
  follow the density tokens; not a second system *(agent)*.
- **Becomes** the spec `.scratch/theming-recipe/`, which also carries the three missing tokens the map's Notes
  send straight to `/to-spec` (modal width, the eyebrows' text-transform, the button's press scale).
