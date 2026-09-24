/* The pass-through guard (core-passthrough 01): principle 1 of the README,
   held by a test rather than by a list in prose.

   Every component the package exports is rendered with a ref, a class, a
   style and a data attribute, and all four have to arrive at one element -
   the one decision P1 of the spec names: the root the component renders; for
   `Modal` and `ConfirmDialog` the <dialog>, for the pickers and the combobox
   family the field's wrapper, for `TreeView` the `role="tree"` list. A caller
   can then hang a tooltip on a `Stat`, measure a `Card` or set a
   `data-testid`, which is the whole point.

   Beside the four it asks for `forwardRef`. React 19 hands a plain function
   component its `ref` as an ordinary prop, so a component that merely spreads
   `...rest` passes the runtime check by accident - and drops the ref under
   React 18, where the package's peer range begins. Only `forwardRef` carries
   it on both, and gives the prop its type.

   The list of exports is read, not written: a new component that stands in
   neither the cases nor the exceptions fails the first test. */

import { describe, expect, it } from "vitest";
import { createRef } from "react";
import type { CSSProperties, ReactElement, Ref } from "react";
import { render } from "@testing-library/react";
import * as core from "../src";
import type { NodeReader } from "../src";

interface Probe {
  ref: Ref<Element>;
  className: string;
  style: CSSProperties;
  "data-probe": string;
}

/* The probe goes in untyped: a component that does not take a ref yet would
   otherwise fail the type check instead of this test - and the type check
   says only "no", where this test names the component. */
type Case = (probe: Probe) => ReactElement;
const p = (probe: Probe) => probe as object;

/* The exceptions of principle 1, each with its reason. None renders an
   element of its own a class could dress. */
const EXCEPTIONS: Record<string, string> = {
  Popover: "renders into a portal; its surface belongs to the caller's content",
  Tooltip: "wraps the caller's child and hands that its handlers",
  Menu: "composed of the caller's trigger and a popover",
  ContextMenu: "composed of a popover at a point; no element of its own stands in the page",
  ToastProvider: "a context with a portal; the toasts belong to the calls of useToast",
  FormFieldBoundary: "a context reset, it renders no element",
  LanguageProvider: "a context, it renders no element",
  UmrissProvider: "a context, it renders no element",
};

interface Leaf {
  id: string;
}
const reader: NodeReader<Leaf> = { key: (o) => o.id, children: () => undefined, label: (o) => o.id };
const roots: Leaf[] = [{ id: "one" }];

function TreeViewCase({ probe }: { probe: Probe }) {
  const tree = core.useTree(roots, { reader });
  return (
    <core.TreeView tree={tree} ariaLabel="Files" {...p(probe)}>
      {(e) => e.node.id}
    </core.TreeView>
  );
}

function TreeSearchCase({ probe }: { probe: Probe }) {
  const tree = core.useTree(roots, { reader });
  return <core.TreeSearch tree={tree} aria-label="Search" {...p(probe)} />;
}

const noop = () => undefined;

const CASES: Record<string, Case> = {
  Alert: (probe) => <core.Alert {...p(probe)}>Text</core.Alert>,
  Badge: (probe) => <core.Badge {...p(probe)}>New</core.Badge>,
  Button: (probe) => <core.Button {...p(probe)}>Save</core.Button>,
  ButtonGroup: (probe) => <core.ButtonGroup {...p(probe)} />,
  SplitButton: (probe) => (
    <core.SplitButton menu={<core.MenuItem>Other</core.MenuItem>} {...p(probe)}>
      Save
    </core.SplitButton>
  ),
  Card: (probe) => <core.Card {...p(probe)} />,
  CardHeader: (probe) => <core.CardHeader title="Title" {...p(probe)} />,
  CardBody: (probe) => <core.CardBody {...p(probe)} />,
  Checkbox: (probe) => <core.Checkbox label="Agree" {...p(probe)} />,
  CommandPalette: (probe) => (
    <core.CommandPalette open={false} onClose={noop} items={[]} onChoose={noop} {...p(probe)} />
  ),
  Combobox: (probe) => <core.Combobox options={[]} value={null} onChange={noop} {...p(probe)} />,
  Meter: (probe) => <core.Meter value={0.5} {...p(probe)} />,
  Sparkline: (probe) => <core.Sparkline data={[1, 2]} {...p(probe)} />,
  DatePicker: (probe) => <core.DatePicker value={null} onChange={noop} {...p(probe)} />,
  DateTimePicker: (probe) => <core.DateTimePicker value={null} onChange={noop} {...p(probe)} />,
  DateRangePicker: (probe) => <core.DateRangePicker value={null} onChange={noop} {...p(probe)} />,
  DateTimeRangePicker: (probe) => (
    <core.DateTimeRangePicker value={null} onChange={noop} {...p(probe)} />
  ),
  Divider: (probe) => <core.Divider {...p(probe)} />,
  EmptyState: (probe) => <core.EmptyState title="Nothing" {...p(probe)} />,
  FormField: (probe) => (
    <core.FormField label="Name" {...p(probe)}>
      <core.Input />
    </core.FormField>
  ),
  Input: (probe) => <core.Input aria-label="Name" {...p(probe)} />,
  Stack: (probe) => <core.Stack {...p(probe)} />,
  Grid: (probe) => <core.Grid {...p(probe)} />,
  MenuItem: (probe) => <core.MenuItem {...p(probe)}>Export</core.MenuItem>,
  MenuSeparator: (probe) => <core.MenuSeparator {...p(probe)} />,
  NumberInput: (probe) => (
    <core.NumberInput aria-label="Count" value={null} onChange={noop} {...p(probe)} />
  ),
  Modal: (probe) => <core.Modal open={false} onClose={noop} {...p(probe)} />,
  ModalHeader: (probe) => <core.ModalHeader title="Title" {...p(probe)} />,
  ModalBody: (probe) => <core.ModalBody {...p(probe)} />,
  ModalFooter: (probe) => <core.ModalFooter {...p(probe)} />,
  ConfirmDialog: (probe) => (
    <core.ConfirmDialog open={false} onClose={noop} onConfirm={noop} title="Sure?" {...p(probe)} />
  ),
  MultiSelect: (probe) => <core.MultiSelect options={[]} value={[]} onChange={noop} {...p(probe)} />,
  RadioGroup: (probe) => (
    <core.RadioGroup aria-label="Choice" options={[{ value: "a", label: "A" }]} {...p(probe)} />
  ),
  Select: (probe) => <core.Select aria-label="Choice" {...p(probe)} />,
  Skeleton: (probe) => <core.Skeleton {...p(probe)} />,
  Spinner: (probe) => <core.Spinner {...p(probe)} />,
  Tag: (probe) => <core.Tag {...p(probe)}>Backend</core.Tag>,
  TagGroup: (probe) => <core.TagGroup aria-label="Tags" {...p(probe)} />,
  Tabs: (probe) => <core.Tabs value="a" onChange={noop} {...p(probe)} />,
  TabList: (probe) => (
    <core.Tabs value="a" onChange={noop}>
      <core.TabList aria-label="Views" {...p(probe)} />
    </core.Tabs>
  ),
  Tab: (probe) => (
    <core.Tabs value="a" onChange={noop}>
      <core.Tab value="a" {...p(probe)}>
        A
      </core.Tab>
    </core.Tabs>
  ),
  TabPanel: (probe) => (
    <core.Tabs value="a" onChange={noop}>
      <core.TabPanel value="a" {...p(probe)} />
    </core.Tabs>
  ),
  Textarea: (probe) => <core.Textarea aria-label="Note" {...p(probe)} />,
  TreeView: (probe) => <TreeViewCase probe={probe} />,
  TreeSearch: (probe) => <TreeSearchCase probe={probe} />,
  Text: (probe) => <core.Text {...p(probe)}>Text</core.Text>,
  Heading: (probe) => <core.Heading {...p(probe)}>Title</core.Heading>,
  Link: (probe) => (
    <core.Link href="#" {...p(probe)}>
      Link
    </core.Link>
  ),
  VisuallyHidden: (probe) => <core.VisuallyHidden {...p(probe)}>Hidden</core.VisuallyHidden>,
  CrossGlyph: (probe) => <core.CrossGlyph {...p(probe)} />,
  PlusGlyph: (probe) => <core.PlusGlyph {...p(probe)} />,
  MinusGlyph: (probe) => <core.MinusGlyph {...p(probe)} />,
  AngleGlyph: (probe) => <core.AngleGlyph {...p(probe)} />,
  GripGlyph: (probe) => <core.GripGlyph {...p(probe)} />,
  GridGlyph: (probe) => <core.GridGlyph {...p(probe)} />,
  MeasureGlyph: (probe) => <core.MeasureGlyph {...p(probe)} />,
  CalendarGlyph: (probe) => <core.CalendarGlyph {...p(probe)} />,
  ClockGlyph: (probe) => <core.ClockGlyph {...p(probe)} />,
  Stat: (probe) => <core.Stat label="Temperature" value={21} {...p(probe)} />,
  Dock: (probe) => <core.Dock tools={[]} {...p(probe)} />,
};

/* Where P1 names a particular element, the element the ref reaches has to be
   that one - not merely some element that carries the four. */
const ROOT: Record<string, (element: Element) => boolean> = {
  Modal: (e) => e.tagName === "DIALOG",
  ConfirmDialog: (e) => e.tagName === "DIALOG",
  CommandPalette: (e) => e.tagName === "DIALOG",
  TreeView: (e) => e.getAttribute("role") === "tree",
  Combobox: (e) => e.querySelector('[role="combobox"]') !== null,
  MultiSelect: (e) => e.querySelector("button") !== null,
  DatePicker: (e) => e.querySelector('[aria-haspopup="dialog"]') !== null,
  DateTimePicker: (e) => e.querySelector('[aria-haspopup="dialog"]') !== null,
  DateRangePicker: (e) => e.querySelector('[aria-haspopup="dialog"]') !== null,
  DateTimeRangePicker: (e) => e.querySelector('[aria-haspopup="dialog"]') !== null,
};

/* The native fields that wear a wrapper: the ref and the rest reach the
   control itself - `name`, `value` and a form library's `register()` belong
   there - and the class dresses the wrapper around it, which is what a
   caller lays out. A decision of principle 1 from before this guard, kept. */
const CLASS_ON_WRAPPER: Record<string, string> = {
  Checkbox: "the class on the label that holds box and text, the rest on the <input>",
  NumberInput: "the class on the field with its stepper, the rest on the <input>",
  Select: "the class on the wrapper with the chevron, the rest on the <select>",
  SplitButton: "the class on the group, the rest on the main action",
};

const FORWARD_REF =Symbol.for("react.forward_ref");

/** What the package exports that React can render: a component is a function
    with a capital name or a `forwardRef` object. Constants (`DEFAULT_*`) are
    neither. */
const components = Object.entries(core)
  .filter(
    ([name, value]) =>
      /^[A-Z][a-z]/.test(name) &&
      (typeof value === "function" ||
        (typeof value === "object" && value !== null && "$$typeof" in value)),
  )
  .map(([name]) => name)
  .sort();

describe("Every exported component passes ref, class, style and the rest through", () => {
  it("stands either among the cases or among the exceptions", () => {
    const unaccounted = components.filter((name) => !(name in CASES) && !(name in EXCEPTIONS));
    expect(unaccounted).toEqual([]);
    const stale = [...Object.keys(CASES), ...Object.keys(EXCEPTIONS)].filter(
      (name) => !components.includes(name),
    );
    expect(stale).toEqual([]);
  });

  it.each(Object.keys(CASES).sort())("%s", (name) => {
    const component = (core as Record<string, unknown>)[name] as { $$typeof?: symbol };
    const ref = createRef<Element>();
    const { container } = render(
      CASES[name]!({
        ref,
        className: "probe-class",
        style: { marginTop: "7px" },
        "data-probe": name,
      }),
    );
    const element = ref.current;
    /* The four are asked together, so that one failure names everything that
       is missing - not only the first. */
    expect({
      forwardRef: component.$$typeof === FORWARD_REF,
      ref: element instanceof Element,
      className:
        name in CLASS_ON_WRAPPER
          ? (element?.parentElement?.closest(".probe-class") ?? null) !== null
          : (element?.classList.contains("probe-class") ?? false),
      style: element instanceof HTMLElement || element instanceof SVGElement
        ? element.style.marginTop === "7px"
        : false,
      rest: element?.getAttribute("data-probe") === name,
      root: element ? (ROOT[name]?.(element) ?? true) : false,
    }).toEqual({ forwardRef: true, ref: true, className: true, style: true, rest: true, root: true });
    // Nothing else in the rendered tree carries the probe: it went to one place.
    expect(container.ownerDocument.querySelectorAll(`[data-probe="${name}"]`)).toHaveLength(1);
  });
});
