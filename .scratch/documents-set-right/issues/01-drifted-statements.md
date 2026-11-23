# 01: The drifted statements are set right

**What to build:** every finding B1-B6, B9, B10 and B12 of
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md`, and from its section C the
sentences on `check:site` (`CONTRIBUTING.md`) and on kept or deleted specs (`docs/agents/triage-labels.md`
against `docs/agents/issue-tracker.md`: a folder is deleted), is set right in the document. Counts that can
be dropped are dropped. The skill names `toPng` and seven packages. ADR-0045 gets its amendment (see the
spec; T8 in `.scratch/release-1-0/issues/20-what-of-the-tokens-and-the-wording-changes-before-1-0.md`), and
its status line and index row agree. Check each line against the source before changing it: the finding's
line numbers may have moved.

Leave alone: the browser floor's wording, the Node line of B5, WebKit and CI sentences, `SECURITY.md`,
`CHANGELOG.md` files, `docs/journal.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M, mechanical (Haiku)

- [ ] `grep -rn "five packages\|six packages\|Six packages\|27 pages\|pnpm 9\|toDataURL" README.md CONTEXT.md CONTRIBUTING.md docs/*.md skills packages/*/README.md`
      finds nothing that is a present-tense claim
- [ ] Each package README names `API.md`; `docs/README.md` has its row
- [ ] `pnpm check demo` and `pnpm check:site` are green
