# 11 - The first release of @umriss-ui/alarms

Status: ready-for-human
Type: task
Size: S

Blocked by: `10-the-standards-claim.md`
Spec: `.scratch/alarms/spec.md`

## What to build

The package goes to npm once, with the whole first version in it. npm gives no Trusted Publisher to a package
that does not exist yet, so the first version is published by hand (`docs/releasing.md`). An agent prepares
the release commit; the maintainer publishes, sets the publisher, and merges.

**What an agent prepares, in the release commit of the workspace's next number:**

- `publish.yml`'s list of directories gains `alarms`, after `table`, in dependency order.
- The root `README.md`:
  - a row for `@umriss-ui/alarms` in the package table;
  - its line in "which package enters what";
  - its preview picture (`pnpm previews`);
  - its `pnpm dev:alarms` port;
  - "released together under one number": seven packages, alarms from this version.
- The front page and the site's texts (`scripts/front-page.html`, `scripts/build-site.mjs`): "Six packages"
  becomes seven, and the family sentence names alarm management.
- `docs/releasing.md`'s list of packages under "One number for all packages".
- The alarms `CHANGELOG.md`: its first heading, from `pnpm changelog`. Core's and table's changelogs get their
  entries for the new keys, the new exports, the date formats and the grid selection.
- The alarms README, read against what the package now does: install, peers, the "use client" paragraph as
  the other READMEs have it, the boundary in three sentences, and the link to the standards section.

**What the maintainer does:**

1. Run the full check before the release: lint, types, unit, build, visual, with ports 4173-4179 free.
2. Publish the first version by hand: `pnpm --filter @umriss-ui/alarms publish`.
3. Set the Trusted Publisher on npm for the package: owner `romanhaendler`, the `publish.yml` workflow, the
   `npm` environment.
4. Set its first tag by hand: `alarms-v<version>`.
5. Merge and push `main`. The workflow then publishes the other packages and finds alarms on npm.

## Acceptance criteria

- [ ] `npm view @umriss-ui/alarms version` answers the release's number.
- [ ] The package's page on npm shows the provenance of the workflow from the next release on.
- [ ] `publish.yml` lists `alarms`, and the next push to `main` publishes or tags it without an error.
- [ ] The root README, the front page and `docs/releasing.md` name seven packages.
- [ ] `pnpm check`, `pnpm check:site`, `pnpm test:visual` and `pnpm -r check:dist` pass on the release commit.
