# 02 - Slider

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F2.

## Acceptance

- Arrow/PageUp/Home/End per APG; marks; format; axe clean; screenshots.

## Comments

Delivered as `Slider` (`src/components/Slider`): native range input drawn with tokens; `value`/`defaultValue`/`onChange(number)`, `min`/`max`/`step`, `marks` (number or `{ value, label }`), `format` for readout and `aria-valuetext`, `showValue`. The keys are the component's own (arrows by a step, PageUp/PageDown by a tenth snapped to the step, Home/End), so they are the same on every engine and testable in jsdom (`tests-unit/slider.test.tsx`), and they are checked in the browser too. The focus ring stands on the thumb pseudo-element; the own-base probe cannot read it, so it is tolerated per example in `own-base.spec.ts` and proven by a before/after picture in `features-basics.spec.ts`. A disabled slider's dimmed mark words fail axe's contrast, so the demo's locked slider shows marks without words.
