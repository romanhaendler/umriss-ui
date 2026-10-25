# 02 - Core loads in Vitest and Jest with its README's lines

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-workspace-on-vitest-5.md`
Spec: `.scratch/test-runners/spec.md`

## What to build

The tracer bullet, end to end for core. An application that copies the Testing section of core's README into
its Vitest 5 or Jest 30 project can render and use core's components in a jsdom test. `check:dist` proves it
on every build.

- **Exports.** Core's JS entries (`.` and `./wording/de`) get a `default` condition after `import`,
  pointing at the same file. `styles.css` stays as it is.
- **Core's README** gets a Testing section with:
  - the Vitest line and why it is needed;
  - the two Jest settings, and the note that Babel's config must be a root config that applies to
    `node_modules`;
  - the `next/jest` note (`transpilePackages`);
  - the setup file with the five jsdom polyfills;
  - the tested runners (Vitest 5 and Jest 30 on jsdom), and that happy-dom and Jest 29 are not promised;
  - `reducedMotion: 'reduce'` for Playwright, and the motion tokens for tools without that switch.

  Each config and setup block names its target file in its info string.
- **The check.** `check-dist` gets the runner step (spec, "The check"):
  1. pack the package and unpack it into a scratch project's `node_modules`;
  2. write the Vitest and Jest projects from the README blocks;
  3. run the package's consumer test file in both runners.

  It also asserts that every `import` entry has an equal `default`. The step is generic, so 03 and 04 only
  add blocks and test files.
- **Core's consumer test** renders a few components through the public entry and uses them the way a user
  does: it opens a Modal, picks an option in a Combobox, and shows a Toast. It asserts on roles, names and
  text only.
- **Root devDependencies:** `jest`, `babel-jest`, `jest-environment-jsdom` and the Babel preset the Jest
  project needs.

## Acceptance criteria

- [ ] `pnpm --filter @umriss-ui/core check:dist` runs core's consumer test under Vitest 5 and Jest 30, and
      passes.
- [ ] Removing the Vitest line from the README block makes the check fail with Vitest's
      `Unknown file extension ".css"`. The same goes for either Jest setting and its error. This proves the
      check is not green by accident (for example through a symlink that Vitest inlines).
- [ ] Removing `default` from one entry makes the check name that entry.
- [ ] The README's Testing section holds every line the scratch projects use; the check writes nothing that
      is not in the README besides the test file and the package itself.
- [ ] `pnpm check core` and `pnpm check:site` pass, and core's `API.md` is regenerated if the gate asks for it.
- [ ] The changelog notes the `default` condition and the Testing section.
