# 02: The manifests name Node 22 and React `^19`

**What to build:** the seven published manifests carry `engines.node >= 22` and peer `react` / `react-dom`
as `^19`; `check:dist` fails for a manifest without either; the prose that names Node and pnpm agrees with
the root manifest (`README.md`, `CONTRIBUTING.md`). See the spec's "Manifests"; findings
`.scratch/release-1-0/research/13-what-the-packages-ship.md` and
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` B5.

**Blocked by:** 01 (same file; same agent, continued)

**Status:** ready-for-agent

**Size:** S

- [ ] Seven manifests changed, the lockfile follows (`pnpm install`)
- [ ] `check:dist` fails on a fixture manifest without `engines` or with `react: ">=19"`
- [ ] `pnpm -r check:dist` and `pnpm check demo` are green
