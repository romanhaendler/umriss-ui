# 04: The wording tables on the Language page

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** On core's Language page, after the examples and before the API section, three tables — "Wording", "Charts wording" (with the sentence that it goes into `Chart`'s `wording` prop and its German into the charts' German subpath) and "Formats" — with columns Key, English, German, Description, grouped by the interfaces' section comments. A function entry shows its parameters and its template body as code; nested entries are flattened with dots; a missing comment reads "—". Rows are anchored at `#wording-<key>`, `#charts-wording-<key>`, `#format-<key>`. HTML and Markdown from one model, prerendered, mounted, in `llms-full`.

- [ ] Wording reader fixtures: string entry, function entry with parameters and body, nested entry flattened, group from a section comment, entry without a comment.
- [ ] Built-site guard: the Language page has an anchor for every key of the three directories, counted against the source.
- [ ] The tables are in `llms-full`.
- [ ] The German column shows the same text `GERMAN_WORDING` and the charts' German wording carry.
