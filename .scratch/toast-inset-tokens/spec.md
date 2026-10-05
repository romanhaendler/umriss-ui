# The toast's distance from the window's edge as tokens

Status: done

## Problem Statement

My application has a fixed header, 60 px tall, at the top of the window. Toasts
stand at `top-end` and should appear below the header, not over the account
chip in it. umriss puts the toast region 20 px below the window's top edge
(16 px up to 600 px wide), and nothing lets me change that.

So my shell reaches into the toast's markup: an unlayered rule on
`body > [data-edge="top"][data-along]` that sets `top: 64px`. By ADR-0045
`data-edge` and `data-along` are internal and may change in any version, a
patch included: an update can put every toast of every application back over
the header, with no error and no changelog entry. The rule is also blunt: it
overrides umriss's own phone distance at every width.

The same gap exists at the bottom: on a phone my toolbar stands at the bottom
of the window, and a `bottom-*` toast covers it.

## Solution

Two new tokens in core, read by the toast region and nothing else:

- `--u-toast-inset-top` - the distance of the region from the window's top
  edge, for the three `top-*` positions.
- `--u-toast-inset-bottom` - the distance from the bottom edge, for the three
  `bottom-*` positions.

Their default is today's behaviour: `--u-space-5`, and `--u-space-4` up to
600 px wide. An application sets them on `:root`, unlayered, as it overrides
any token, and may set them differently per breakpoint:

```css
:root { --u-toast-inset-top: calc(60px + var(--u-space-2)); }
@media (max-width: 600px) { :root { --u-toast-inset-top: calc(56px + var(--u-space-2)); } }
```

The internal selector in the shell goes away.

## User Stories

1. As an application developer, I want to set the toasts' distance from the top of the window with one token, so that they appear below my fixed header instead of over it.
2. As an application developer, I want to set the toasts' distance from the bottom of the window with one token, so that a `bottom-*` toast does not cover a toolbar at the bottom.
3. As an application developer, I want the top token to move all three `top-*` positions, so that the place I choose along the edge does not decide whether the header is respected.
4. As an application developer, I want the bottom token to move all three `bottom-*` positions, for the same reason.
5. As an application developer, I want the top token to leave `bottom-*` toasts where they are, and the bottom token `top-*` toasts, so that I can set one edge without thinking about the other.
6. As an application developer, I want a value I set on `:root` to hold at every width, phone included, so that my header is respected on a phone as on a desktop.
7. As an application developer, I want to set a different value per breakpoint in my own media query, so that a header that is shorter on a phone gets its own distance.
8. As an application developer, I want the tokens to accept any length - `calc()`, `var()` of another token, `max()` - so that I can write "header height plus a little air" in one expression.
9. As an application developer who sets neither token, I want the toasts to stand exactly where they stand today, on a desktop and under 600 px, so that the update changes nothing I did not ask for.
10. As an application developer, I want both tokens listed on the Theming page with their default and what they move, so that I find them where every other token is.
11. As an application developer, I want the Theming page's row to say that the default changes under 600 px, so that I am not surprised that the value in the table is not what I measure on a phone.
12. As an application developer, I want the documentation to say that the tokens take effect on `:root` only - the region hangs directly in `body` (or in an open dialog), not inside my subtree - so that I do not set them on a container and wonder why nothing moves.
13. As an application developer, I want the tokens in the llms text as well, so that a coding assistant proposes them instead of a selector on the markup.
14. As an application developer, I want the tokens' arrival in the changelog as a feature, so that I know from which version I can drop my workaround.
15. As an application developer, I want the toast example "Where they stand" to show that the distance is a token, so that I find the setting from the place where I look at positions.
16. As a user of an application with a fixed header, I want a toast to appear below the header, so that it does not hide the account chip or the navigation I am about to use.
17. As a user on a phone, I want a bottom toast not to cover the toolbar at the bottom of the screen, so that I can keep working while it is visible.
18. As a maintainer, I want the toast's markup to stay internal, so that I can rename `data-edge` and `data-along` without breaking an application.

## Implementation Decisions

- **Two tokens, declared in core's token stylesheet** in a section of their
  own ("Toast"), on `:root` in the layer `umriss.tokens`, as every core token
  is (CONTEXT: **Token**). The desktop default is declared on `:root`, the
  phone default in a `max-width: 600px` media block in the same layer. An
  application's unlayered `:root` declaration beats both at every width - that
  is the layer order, not specificity (ADR-0021).
- **The region reads the tokens once.** The top edge reads
  `--u-toast-inset-top`, the bottom edge `--u-toast-inset-bottom`. The
  region's own phone rule no longer sets `top`/`bottom`: the phone value lives
  in the token. The phone rule keeps what it does besides (window width, inline
  insets).
- **Only the block edge.** The distance along the edge (inline start/end, the
  phone's side margins) gets no token; nobody has asked for one.
- **The token reader is not extended.** It ignores declarations inside a media
  block other than reduced motion; the phone default is therefore written in
  the token's comment, which becomes its description on the Theming page
  ("`--u-space-4` up to 600 px wide"). ponytail: if a second token gains a
  breakpoint default, the reader gets a column for it the way it has one for
  reduced motion.
- **Effect on `:root` only, and said so.** The region is portalled into
  `body` (or the open dialog), so a token set on an application's container
  does not reach it. The Theming page's section on tokens for one region names
  this exception, and the token's comment says "on `:root`".
- **Changelog:** a feature entry in core's changelog (ADR-0045: a new token is
  a feature).

## Testing Decisions

A good test here measures where the region stands, from outside, as a user
sees it - never which selector or attribute put it there.

- **Layout seam (Playwright, on the Toast page's "Where they stand"
  example).** The only seam: jsdom inherits no custom properties and lays
  nothing out. Without the tokens set, the region's top (for `top-*`) and its
  distance from the bottom (for `bottom-*`) are 20 px at 1280 px and 16 px at
  320 px - the pixel-exact promise. With `--u-toast-inset-top` set on
  `:root` by the test, all three `top-*` positions stand at that value at
  1280 and at 320 px, and the `bottom-*` positions are unmoved; likewise the
  other way round for `--u-toast-inset-bottom`. Prior art: the toast tests in
  the basics feature spec, and the Sizes behaviour tests of ADR-0041, which
  measure boxes on an example page.
- **The Theming table** needs no test of its own: the existing token-table
  test fails when a declared token has no row.

## Out of Scope

- **Safe areas** (`env(safe-area-inset-*)`). umriss knows none today, and the
  toast is not the only part at the window's edge - the dock and the sheet are
  too. Adding it to one of them makes the three disagree on a notched phone;
  it is a spec of its own when a full-screen web app needs it. An application
  that needs it now writes it into the token itself:
  `--u-toast-inset-top: max(var(--u-space-4), env(safe-area-inset-top))`.
- A token or prop for the inline distance, the region's width, or a position
  relative to an element instead of the window.
- A `ToastProvider` prop for the distance: a token switches per breakpoint
  without JavaScript and is the styling API (ADR-0045).

## Further Notes

The request came from the portal shell, which today overrides
`body > [data-edge="top"][data-along] { top: 64px }`. Once this ships, that
rule should be deleted in favour of the token.
