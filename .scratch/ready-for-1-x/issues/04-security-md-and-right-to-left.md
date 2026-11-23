# 04: `SECURITY.md`, and the sentence on right-to-left

**What to build:** a `SECURITY.md` at the root (reports through GitHub's private vulnerability reporting of
the repository; a fix goes into the latest minor only, ADR-0083; no bounty and no deadline promised), linked
from the root `README.md` and from `docs/README.md`; and one sentence in the root README that right-to-left
is not supported. Read what `.scratch/security-hardening/` and
`.scratch/release-1-0/research/14-what-scratch-still-holds.md` say about `SECURITY.md` first. Do not touch
the browser floor's wording in the README: another worker rewrites it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** S (Haiku)

- [ ] `SECURITY.md` exists, under forty lines, names no person and no address but the repository's
- [ ] Both links resolve; `pnpm check:site` is green
- [ ] The right-to-left sentence stands in the root README
