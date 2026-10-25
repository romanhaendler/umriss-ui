# 05 - A calculation's places carry down, and a non-zero total never reads 0

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr.md`
Spec: `.scratch/number-formats/spec.md`

## What to build

A calculation author writes `decimals={2}` on a sum in €, with inner products in € and their givens in hours
and €/h. Every euro line shows two places: no more "51.6 €" beside "56.28 €". The hours keep their own
places. A total of 1e-9 mg + 2e-9 mg no longer reads "0 mg".

- **Carried places.** When the model is read, a quantity without its own `decimals` takes those of the
  quantity it is an operand of, where both have the same `unit` and the same `format`:
  - this holds down the tree and through a chain's interims;
  - a `Ref` takes its places where its quantity is defined, not where it is referenced;
  - carried places count as the caller's: they are padded, and they decide the "≈";
  - with `metrics` set, the metric's places hold as today (ADR-0038).
- **Never reads 0.** The built-in default places are two for a derived number and one for a percentage.
  Where they would round a non-zero derived value to 0, the default does not apply: the value is shown
  without fixed places, and core's `number` writes it, in scientific notation where it is tiny. A caller's
  own or carried `decimals` are kept as given.
- **The doc line** of `decimals` says that the places carry down to operands of the same unit and format.

## Acceptance criteria

- [ ] The model test pins carried places:
  - [ ] the same unit takes them;
  - [ ] another unit does not;
  - [ ] another format does not;
  - [ ] a reference takes them where its quantity is defined;
  - [ ] a chain's interims carry them.
- [ ] The evaluation test pins the tiny derived total: shown non-zero, without "≈" where the shown operands
      give it.
- [ ] The calculation's render test shows the composed-app case: a sum with `decimals={2}`, inner products in
      € read with two places, hours as given.
- [ ] `pnpm check calculation` and `pnpm check:site` pass, and calculation's `API.md` is regenerated.
- [ ] `pnpm test:visual:quick calculation` passes. Any baseline that changes through the padded places is
      renewed and the count is stated.
- [ ] The calculation's changelog notes the carried places and the tiny total.
