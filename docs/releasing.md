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
| Publishing | `.github/workflows/publish.yml` — on every push to `main`, every version not on npm yet |

## Tags on npm

* **`latest`** is what `pnpm add @umriss-ui/<package>` installs. Only a released
  version goes there.
* **`next`** carries release candidates (`0.3.0-rc.1`); at the moment it
  carries nothing, because every package is released. A candidate is published
  with `--tag next` written out — the workflow does so for every version with
  a hyphen. `publishConfig.tag` in a manifest does not help, because **pnpm
  9.14.4 does not pass it on** — a dry run announced `latest` regardless. The very first version of a package gets `latest` as
  well, because a package without `latest` does not exist, and it stays there
  when the next candidate goes to `next` — so as long as no released version
  exists, `latest` is moved to each new candidate by hand (step 5), or a plain
  `pnpm add` keeps installing the first one.

Every manifest has `publishConfig.access: "public"` — a scoped package is
otherwise published as private, and the org would refuse it.

## Publishing a version

A version is released by raising it. On every push to `main`,
`.github/workflows/publish.yml` asks npm for each package whether the version
in its `package.json` stands there already; whatever is missing is published,
in dependency order (`core` and `charts` before what depends on them), after
lint, types, unit tests, build and `check:dist`. A version with a hyphen
(`0.3.0-rc.1`) goes to `next`, every other to `latest`. A push that raises no
version publishes nothing, and the same version is never published twice.

After each package the workflow sets its tag, `<dir>-v<version>` — one per
package, because the packages count independently. The tag only marks the
commit; it triggers nothing, and none is set by hand.

No token is involved: each package on npm trusts that workflow through Trusted
Publishing (package settings → *Trusted Publisher*: owner `romanhaendler`,
repository `umriss-ui`, workflow `publish.yml`, environment `npm`, *Allow npm
publish* ticked), and npm attaches the provenance itself. Under *Publishing
access* every package requires two-factor authentication and refuses tokens
that bypass it. The workflow packs with pnpm — only pnpm rewrites the
`workspace:` ranges (`@umriss-ui/table` takes `@umriss-ui/core` as
`workspace:^`) — and uploads the tarball with npm, because pnpm 9.14.4 cannot
do Trusted Publishing.

1. The version in `packages/<package>/package.json` and a heading of that number
   in its `CHANGELOG.md`, in one commit. Several packages may move in the same
   commit.
2. The package's `README.md` read against what it now claims. Every roadmap
   line against the status of the spec it names under `.scratch/` — a spec that
   went `done` leaves the roadmap; a figure only by a link to the record that
   holds it (the charts' benchmark stands once, in `docs/capabilities.md`); a
   "cannot" against ADR-0032. No test holds this: a README is prose, and a lint
   over prose would check the wording, not the truth.
3. `pnpm test:visual` — green. It is the one check the workflow cannot run.
4. Push to `main`. The run is under *Actions → Publish*; if one package fails,
   the rest of that run stops, and the next push — or *Run workflow* on the
   same page — publishes what is still missing.
5. For a release candidate of a package that has no released version yet, move
   `latest` along:
   ```bash
   npm dist-tag add @umriss-ui/charts@0.3.0-rc.1 latest
   ```

A package that does not stand on npm yet cannot be given a Trusted Publisher,
so its first version is published by hand before it reaches `main`, the
publisher is set up, and the package is added to the list in `publish.yml`;
its first tag is set by hand as well:

```bash
pnpm --filter @umriss-ui/<package> publish
git tag <dir>-v<version> && git push origin <dir>-v<version>
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
