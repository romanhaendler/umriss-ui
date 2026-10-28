# 06 - The breadcrumb, the CSV and the XLSX withstand hostile input

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "Hostile-input tests")

## What to build

The three escapers the library has are tested from the outside with hostile
input: a breadcrumb entry followed through the folded menu, a CSV and an XLSX
written through the public export and read back. If a test fails, the escaper
is fixed at the escaper, where all callers route through.

## Acceptance criteria

- [ ] Breadcrumb (extends core's breadcrumb unit test, rendered and followed through the folded menu): `javascript:alert(1)`, mixed-case `JaVaScRiPt:`, leading space, leading tab, a line break inside the scheme, a leading NUL, `data:text/html,…` and `vbscript:` navigate nowhere; an `https:` URL, `mailto:`, `tel:`, a relative path and a fragment navigate.
- [ ] CSV (extends the CSV formula tests): a formula after leading spaces, a formula that also forces quoting (separator or line break inside), a full-width `＝`, and each of these as a column label; the existing cases stay.
- [ ] XLSX (extends the XLSX tests that unzip and read back): `=1+1` is a string cell, never a formula; `<`, `&`, `"`, `]]>` survive as text; control characters below U+0020 other than tab, LF, CR and lone surrogates leave the XML valid; a sheet name of only forbidden characters falls back to the default name.
- [ ] `pnpm check core` and `pnpm check table` pass.
