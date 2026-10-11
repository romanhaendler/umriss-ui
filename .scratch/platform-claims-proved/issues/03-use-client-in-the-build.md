# 03 - "use client" at the head of every built entry, and checked

Status: ready-for-agent
Type: task
Size: M

Blocked by: none
Spec: `.scratch/platform-claims-proved/spec.md` - P5 to P9 and "What the build does today"

## What to build

`scripts/styles/useClient.ts`, a Vite plugin beside `importOwnCss.ts`
(`apply: "build"`, `enforce: "post"`, `writeBundle`): for every `isEntry` chunk
of the bundle, prepend `"use client";\n` unless the file already begins with
it. Added to the `plugins` of core, charts, table, schedule and calculation,
**after** `importOwnCss(...)`, with a comment saying why the order matters.
Core's and charts' `wording/de` entries are covered because they are entry
chunks; core's shared `formats-*.js` is not.

`scripts/check-dist.ts`: read `package.json` of the package directory and, for
every distinct file under `exports[*].import`, fail unless it begins `"use
client";`. The main entry then continues with `import "./<stylesheet>";` as its
second statement - the existing first-statement test moves one line down. The
usage line and the comment at the head of the file say so. The check reads the
manifest, so `./xlsx` is checked from the day `table-xlsx` declares it, and its
entry carries the directive with no edit to the plugin.

Add `pnpm -r check:dist` to the `check` job of `ci.yml` after `pnpm build`, and
update the comment in `importOwnCss.ts` ("at the head" becomes "right after the
directive"). Do not put a directive in any `src/` file: the build drops it.

## Acceptance

- [ ] After `pnpm build`, `head -c 14` of each of the seven entry files (five
      mains, two wordings) is `"use client";`.
- [ ] `check:dist` fails when the directive is removed from one entry, when the
      stylesheet import is first, and when `exports` names a file that does not
      begin with it; it passes on a clean build.
- [ ] `pnpm test:unit` and the demos build as before (the directive is only in
      `dist/`).
- [ ] A node import of `dist/core.js` still works (a string expression statement
      is harmless outside a bundler).
