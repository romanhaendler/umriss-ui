# DEV warnings for the silent traps

Type:   grilling
Status: claimed

## Question

Which silent traps get a DEV warning, and which a sentence in the documents instead?

Six personas fell into one (`.scratch/shakedown/wishes.md` section 2, `cross-package.md` 15 - the Vite fix is
delivered): a wrong data shape; inline accessors that close over state and go stale because they are compared
by source text (`audit-family.md` 3, `composed-app.md` 1); a seventh chart series repeating the first colour
(`audit-family.md` 4); a missing `Pagination`; a browser below the floor; a Calculation without `aria-label`
(`audit-family.md` 10); numbers given as strings sorting as text (`table.md` 7); an epoch number in a
column (`operator-screens.md` 4).

- For each: warn, document, or change the behaviour (for the stale accessor: is a warning possible at all,
  or does the source-text comparison change)?
- One warning helper shared by the packages, or each its own as today?
