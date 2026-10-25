# A theme object

Type:   grilling
Status: open

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
