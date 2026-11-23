# 03: `.scratch/` holds open work only

**What to build:** following `.scratch/release-1-0/research/14-what-scratch-still-holds.md`: first every
pointer from `docs/`, `CONTEXT.md`, `CLAUDE.md`, `skills/` and the packages into a finished folder is set
right (to the document, ADR or test that now holds the fact, or removed); the three reference matrices and
the page study it names move to `docs/research/` with a row in `docs/README.md`; then the folders it marks
"delete" are deleted.

Never touch: `.scratch/release-1-0`, `.scratch/api-md-lists-the-surface`, `.scratch/ready-for-1-x`,
`.scratch/browsers-and-axe-in-ci`, `.scratch/documents-set-right`, `.scratch/fixes-without-a-break`,
`.scratch/chart-navigator`, `.scratch/local-docs`, `.scratch/security-hardening`. Of
`.scratch/open-points-roadmap` only the delivered parts go.

Before deleting `straighten-0-49` and `shakedown-2026-10-31`, copy into your report, word for word and
short: the two undecided design notes, and the lists "kept by judgement" and "wishes not taken". The
coordinator decides where they go; do not delete those two folders yourself, name them as ready.

No client, private project, path, host or person may enter `docs/research/` with a moved file: read each
before moving it and report any such line instead of moving it.

**Blocked by:** 02 (the comments that cite the folders go first)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] `grep -rn "\.scratch/" docs CONTEXT.md CLAUDE.md skills packages --include=*.md` finds only general
      mentions of the tracker and folders that exist
- [ ] The report lists every folder deleted, every file moved, and the two folders left for the coordinator
- [ ] `pnpm check:site` and `pnpm check demo` are green
