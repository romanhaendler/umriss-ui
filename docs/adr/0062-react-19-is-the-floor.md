# React 19 is the floor

Status: accepted
Date:   2026-10

The five packages declared React 18 or newer as their peer, and a CI job
resolved React 18.3.1 afresh to prove it. Holding 18 had a price that showed
in the bundle: React 18 hands a ref to a component only through `forwardRef`,
so every component was a `forwardRef` call at the top of its module. Such a
call is a side effect a bundler cannot drop, and core did not shake - one
`Button` cost 43.5 KB gzipped of the 51.5 KB that a whole import came to. Two
helpers also existed only to bridge the lines: one chose the place of an
element's ref by the major version, one wrote `inert` as a string on 18 and a
boolean on 19.

**React 19 is the floor: the peers `react` and `react-dom` are `>=19` in all
five packages, a component takes `ref` as a prop and is never wrapped in
`forwardRef`, and nothing in the source reads React's `version`.**

## What follows

- An element's ref is read from its props, where React 19 keeps it, and
  nowhere else.
- `inert` is written as the boolean attribute it is; the helper that chose
  between two spellings is gone.
- The pass-through guard asks that the ref arrives at the root, not how. While
  components are being taken out of their wrappers, a wrapped and a plain one
  both pass; when the last wrapper is gone the guard asks for the plain form.
- The CI job that resolved React 18.3.1 is gone. The version switches are
  not to be restored: a line of code that asks which React is running is a
  line that proves the floor was not set.

## What it costs

- An application on React 18 stays on the last version of the packages before
  this one. Nothing is backported.
- A caller who passed a ref through a wrapper of their own written for 18 is
  not affected; one who relied on `forwardRef` objects being the type of our
  components (`$$typeof`) is.

## Why it was worth it

The wrapper kept core from shaking, and the only thing that required it was a
line of React the packages no longer supported. A floor that moved from 18 to
19 costs the applications still on 18 one upgrade; it gives every other
application a package whose unused components cost nothing.
