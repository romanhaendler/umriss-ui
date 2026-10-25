/* The pass-through guard of a package: every component it exports is rendered
   with a ref, a class, a style and a data attribute, and each has to arrive
   where the component's shape says (core's README, principle 1).

   - element: all four on the element the ref reaches.
   - field:   class and style on an ancestor wrapper, ref and the rest on the control.
   - split:   class on the wrapper, style with the rest on the control.

   The list of exports is read, not written: a component that stands in
   neither the cases nor the exceptions fails the first test. A `forwardRef`
   object among the exports fails too (ADR-0062: the wrapper is a call at the
   top of a module, which a bundler has to keep). */

import { describe, expect, it } from "vitest";
import { createRef, forwardRef } from "react";
import type { CSSProperties, ReactElement, Ref } from "react";
import { render } from "@testing-library/react";

export interface Probe {
  ref: Ref<Element>;
  className: string;
  style: CSSProperties;
  "data-probe": string;
}

export interface PassThroughCase {
  render: (probe: Probe) => ReactElement;
  /** Default `element`. */
  shape?: "element" | "field" | "split";
  /** Which element the ref has to reach, where the contract names one. */
  root?: (element: Element) => boolean;
}

/** The names of the exports that are `forwardRef` objects. */
const wrappedIn = (exports: Record<string, unknown>): string[] =>
  Object.entries(exports)
    .filter(([, value]) => (value as { $$typeof?: symbol } | null)?.$$typeof === Symbol.for("react.forward_ref"))
    .map(([name]) => name);

/** `exceptions`: component name to the reason it has no element of its own. */
export function passThroughGuard(
  pkg: string,
  exports: Record<string, unknown>,
  cases: Record<string, PassThroughCase>,
  exceptions: Record<string, string>,
): void {
  /* What React can render: a function with a capital name, or a wrapped
     object (which the guard then refuses). Constants (`DEFAULT_*`) are neither. */
  const components = Object.entries(exports)
    .filter(
      ([name, value]) =>
        /^[A-Z][a-z]/.test(name) &&
        (typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value)),
    )
    .map(([name]) => name)
    .sort();

  describe(`Every exported component of ${pkg} passes ref, class, style and the rest through`, () => {
    it("stands either among the cases or among the exceptions", () => {
      const unaccounted = components.filter((name) => !(name in cases) && !(name in exceptions));
      expect(unaccounted).toEqual([]);
      const stale = [...Object.keys(cases), ...Object.keys(exceptions)].filter(
        (name) => !components.includes(name),
      );
      expect(stale).toEqual([]);
    });

    it("refuses an export wrapped in forwardRef, by name", () => {
      const Wrapped = forwardRef<HTMLDivElement>((_props, ref) => <div ref={ref} />);
      expect(wrappedIn({ Wrapped, Plain: () => null })).toEqual(["Wrapped"]);
      expect(wrappedIn(exports)).toEqual([]);
    });

    it.each(Object.keys(cases).sort())("%s", (name) => {
      const { render: draw, shape = "element", root } = cases[name]!;
      const ref = createRef<Element>();
      const { container } = render(
        draw({ ref, className: "probe-class", style: { marginTop: "7px" }, "data-probe": name }),
      );
      const element = ref.current;
      const wrapper = element?.parentElement?.closest<HTMLElement>(".probe-class") ?? null;
      const styled = element instanceof HTMLElement || element instanceof SVGElement;
      const own = styled ? element.style.marginTop : "";
      /* The four are asked together, so that one failure names everything
         that is missing - not only the first. */
      expect({
        ref: element instanceof Element,
        className: shape === "element" ? (element?.classList.contains("probe-class") ?? false) : wrapper !== null,
        style: shape === "field" ? (wrapper?.style.marginTop ?? "") === "7px" && own === "" : styled && own === "7px",
        rest: element?.getAttribute("data-probe") === name,
        root: element ? (root?.(element) ?? true) : false,
      }).toEqual({ ref: true, className: true, style: true, rest: true, root: true });
      // Nothing else in the rendered tree carries the probe: it went to one place.
      expect(container.ownerDocument.querySelectorAll(`[data-probe="${name}"]`)).toHaveLength(1);
    });
  });
}
