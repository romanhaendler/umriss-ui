# Releasing

How a version of `@umriss-ui/core`, `@umriss-ui/charts`, `@umriss-ui/table`,
`@umriss-ui/schedule` or `@umriss-ui/calculation`
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
* **`next`** carries release candidates (`0.3.0-rc.1`); at the moment it
  carries nothing, because every package is released. A candidate is published
  with `--tag next` written out (the workflow does so for every version with a hyphen): `publishConfig.tag` in a manifest does
  not help, because **pnpm 9.14.4 does not pass it on** — a dry run announced
  `latest` regardless. The very first version of a package gets `latest` as
  well, because a package without `latest` does not exist, and it stays there
  when the next candidate goes to `next` — so as long as no released version
  exists, `latest` is moved to each new candidate by hand (step 4), or a plain
  `pnpm add` keeps installing the first one.

Every manifest has `publishConfig.access: "public"` — a scoped package is
otherwise published as private, and the org would refuse it.

## Publishing a version

A pushed tag publishes: `.github/workflows/publish.yml` runs on every tag
`<dir>-v<version>`, checks that the version in `packages/<dir>/package.json`
matches, runs lint, types, unit tests, build and `check:dist`, and uploads the
package. A version with a hyphen (`0.3.0-rc.1`) goes to `next`, every other to
`latest`. No token is involved: each package on npm trusts that workflow
through Trusted Publishing (package settings → *Trusted Publisher*: owner
`romanhaendler`, repository `umriss-ui`, workflow `publish.yml`, environment
`npm`), and npm attaches the provenance itself.

The workflow packs with pnpm — only pnpm rewrites the `workspace:` ranges
(`@umriss-ui/table` takes `@umriss-ui/core` as `workspace:^`) — and uploads the
tarball with npm, because pnpm 9.14.4 cannot do Trusted Publishing.

1. The version in `packages/<package>/package.json` and a heading of that number
   in its `CHANGELOG.md`, in one commit on `main`, pushed.
2. `pnpm test:visual` — green. It is the one check the workflow cannot run.
3. Tag the commit and push the tag, one push per tag — GitHub starts no
   workflow for tags when more than three arrive in one push. Push `core` before
   `table` when both move: the table's peer range names core's new version.
   ```bash
   git tag core-v0.5.0 && git push origin core-v0.5.0
   ```
   One tag per package, because the packages count independently.
4. For a release candidate of a package that has no released version yet, move
   `latest` along:
   ```bash
   npm dist-tag add @umriss-ui/charts@0.3.0-rc.1 latest
   ```

A package that does not stand on npm yet cannot be given a Trusted Publisher,
so its first version is published by hand, then the publisher is set up:

```bash
pnpm --filter @umriss-ui/<package> publish
```

Promoting a release candidate that already stands on the registry to `latest`
without publishing again:

```bash
npm dist-tag add @umriss-ui/charts@0.3.0 latest
```

A version that went out wrong is deprecated, not unpublished — a published
number can never be used again:

```bash
npm deprecate @umriss-ui/core@0.2.0 "Broken build, use 0.2.1"
```
