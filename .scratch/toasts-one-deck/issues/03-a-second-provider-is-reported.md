# 03: A second ToastProvider is reported in development

**What to build:** An application developer who mounts a second `ToastProvider` in the same document, while another one stands, gets one console warning in development naming the rule: one `ToastProvider` per application, at its root. Nothing changes in production; nothing throws.

**Blocked by:** 02 (until then the demo itself would warn on every page)

**Status:** done

Spec: `.scratch/toasts-one-deck/spec.md` (Implementation Decisions "One provider per application", User Stories 19–20)

- [x] Development only (`import.meta.env?.DEV`, like the duplicate-key warning of `useTree`): one `console.warn` prefixed `@umriss-ui/core:` when a provider mounts while another is mounted in the document; once per provider
- [x] Unit test: two providers at once warn once; one provider, or two after each other, do not warn
- [x] The text of `ToastProvider` and the Known limits of the Toast page name the rule and what breaking it gives (two decks at the same place)
- [x] No demo page warns (checked in the browser console of the Toast and UmrissProvider pages)
- [x] `pnpm check core`, `pnpm check:site` green
- [x] One commit, no push

## Comments

A module counter in `Toast.tsx` is checked in a mount effect; the warning is once per provider (a ref). Unit tests in `toast.test.tsx`; text added to the Toast page limits in `outline.ts`. Console of the Toast and UmrissProvider demo pages (dev server): no warnings.
