# 16: Charts take their wording from one provider

**What to build:** A German app with charts sets one provider at its root and every chart speaks German - also a chart inside a dashboard widget, which falls back to English today. Charts export a `ChartsWordingProvider` taking a partial `ChartsWording`; a chart merges the default, then the provider, then its own `wording` prop, so one chart can still differ. Charts keep no dependency on core; an app with both packages sets both providers, and the docs say so where they speak of language. ADR-0031 gets a dated amendment. Spec: `../spec.md` ("Charts wording provider"); repros: `../personas/p4-jonas.md` 3, `../personas/p13-third-language.md` 8.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A component test: inside the provider with the German wording, axis dates and the legend are German; a chart's own `wording` prop wins over the provider
- [ ] Without a provider nothing changes (existing tests green)
- [ ] A consumer test imports the provider from the built package
- [ ] charts' README and `llms-full.md`, and core's language page, name the provider; API.md regenerated; ADR-0031 amended
- [ ] Commit body: `Changelog charts Added:` line
