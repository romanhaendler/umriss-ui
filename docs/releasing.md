# Releasing

How a version of `@umriss-ui/core`, `@umriss-ui/charts` or `@umriss-ui/table`
reaches npm, and how the demos reach GitHub Pages. What a version *means* for a
caller stands in the package's own `CHANGELOG.md`; this page is only the
mechanics.

## Where things live

| What | Where |
|---|---|
| Source | <https://github.com/romanhaendler/umriss-ui> |
| Packages | the npm org <https://www.npmjs.com/org/umriss-ui> |
| Demos | <https://romanhaendler.github.io/umriss-ui/> — deployed by `.github/workflows/pages.yml` on every push to `main` |
| Checks | `.github/workflows/ci.yml` — lint, types, unit tests, build. The screenshot suite stays local (its baselines are darwin's) |

## Tags on npm

* **`latest`** is what `pnpm add @umriss-ui/<package>` installs. Only a released
  version goes there.
* **`next`** carries release candidates (`0.3.0-rc.0`). `charts` and `table`
  have `publishConfig.tag: "next"` in their manifests, so a publish of those two
  cannot land on `latest` by accident — with one exception the registry makes:
  the very first version of a package gets `latest` as well, because a package
  without `latest` does not exist. It stays there until a released version
  replaces it. When one of them is released, that line
  comes out of its manifest in the same commit as the version.

Every manifest has `publishConfig.access: "public"` — a scoped package is
otherwise published as private, and the org would refuse it.

## Publishing a version

Always with **pnpm**, never with `npm publish`: the manifests carry
`workspace:` ranges (`@umriss-ui/table` takes `@umriss-ui/core` as
`workspace:^`), and only `pnpm publish` rewrites them into real ranges.
`prepublishOnly` runs typecheck and build before anything is uploaded.

1. The version in `packages/<package>/package.json` and a heading of that number
   in its `CHANGELOG.md`, in one commit on `main`.
2. `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:visual` — green.
3. Look at what would be uploaded:
   ```bash
   pnpm --filter @umriss-ui/core publish --dry-run
   ```
4. Publish (npm asks for the one-time password of the account):
   ```bash
   pnpm --filter @umriss-ui/core publish
   ```
5. Tag the commit and push the tag:
   ```bash
   git tag core-v0.1.0 && git push origin core-v0.1.0
   ```
   One tag per package, `<dir>-v<version>`, because the three packages count
   independently.

Promoting a release candidate that already stands on the registry to `latest`
without publishing again:

```bash
npm dist-tag add @umriss-ui/charts@0.3.0 latest
```

A version that went out wrong is deprecated, not unpublished — a published
number can never be used again:

```bash
npm deprecate @umriss-ui/core@0.1.0 "Broken build, use 0.1.1"
```
