# 03: A second ToastProvider is reported in development

**What to build:** An application developer who mounts a second `ToastProvider` in the same document, while another one stands, gets one console warning in development naming the rule: one `ToastProvider` per application, at its root. Nothing changes in production; nothing throws.

**Blocked by:** 02 (until then the demo itself would warn on every page)

**Status:** ready-for-agent

Spec: `.scratch/toasts-one-deck/spec.md` (Implementation Decisions "One provider per application", User Stories 19–20)

- [ ] Development only (`import.meta.env?.DEV`, like the duplicate-key warning of `useTree`): one `console.warn` prefixed `@umriss-ui/core:` when a provider mounts while another is mounted in the document; once per provider
- [ ] Unit test: two providers at once warn once; one provider, or two after each other, do not warn
- [ ] The text of `ToastProvider` and the Known limits of the Toast page name the rule and what breaking it gives (two decks at the same place)
- [ ] No demo page warns (checked in the browser console of the Toast and UmrissProvider pages)
- [ ] `pnpm check core`, `pnpm check:site` green
- [ ] One commit, no push
