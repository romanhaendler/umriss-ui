/* The pass-through guard: principle 1 of the README,
   held by a test rather than by a list in prose.

   Every component the package exports is rendered with a ref, a class, a
   style and a data attribute, and all four have to arrive at one element -
   the one decision P1 of the spec names: the root the component renders; for
   `Modal` and `ConfirmDialog` the <dialog>, for the pickers and the combobox
   family the field's control, for `TreeView` the `role="tree"` list. A caller
   can then hang a tooltip on a `Stat`, measure a `Card` or set a
   `data-testid`, which is the whole point.

   It also asks for the form: React 19 hands a plain function component its
   `ref` as an ordinary prop, so a `forwardRef` object among the exports fails,
   named. The wrapper is a call at the top of a module, which a bundler has to
   keep with everything it reaches - the package would stop shaking
   (ADR-0062) - and the props types declare `ref` themselves (`RefProp`).

   The list of exports is read, not written: a new component that stands in
   neither the cases nor the exceptions fails the first test. */

import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { fireEvent, render } from "@testing-library/react";
import * as core from "../src";
import type { NodeReader } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase, Probe } from "../../demo/tests-support/passThroughGuard.tsx";

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
  ControlSizeProvider: "a context, it renders no element",
};

interface Leaf {
  id: string;
}
const reader: NodeReader<Leaf> = { key: (o) => o.id, children: () => undefined, label: (o) => o.id };
const roots: Leaf[] = [{ id: "one" }];

function TreeViewCase({ probe }: { probe: Probe }) {
  const tree = core.useTree(roots, { reader });
  return (
    <core.TreeView tree={tree} aria-label="Files" {...p(probe)}>
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
  IconButton: (probe) => (
    <core.IconButton aria-label="Close" {...p(probe)}>
      ×
    </core.IconButton>
  ),
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
  SegmentedControl: (probe) => (
    <core.SegmentedControl aria-label="Choice" options={[{ value: "a", label: "A" }]} {...p(probe)} />
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
  EndGlyph: (probe) => <core.EndGlyph {...p(probe)} />,
  GripGlyph: (probe) => <core.GripGlyph {...p(probe)} />,
  GridGlyph: (probe) => <core.GridGlyph {...p(probe)} />,
  MeasureGlyph: (probe) => <core.MeasureGlyph {...p(probe)} />,
  CalendarGlyph: (probe) => <core.CalendarGlyph {...p(probe)} />,
  ClockGlyph: (probe) => <core.ClockGlyph {...p(probe)} />,
  MoreGlyph: (probe) => <core.MoreGlyph {...p(probe)} />,
  Stat: (probe) => <core.Stat label="Temperature" value={21} {...p(probe)} />,
  Switch: (probe) => <core.Switch label="Automatic" {...p(probe)} />,
  Slider: (probe) => <core.Slider aria-label="Setpoint" {...p(probe)} />,
  Drawer: (probe) => <core.Drawer open={false} onClose={noop} {...p(probe)} />,
  ProgressBar: (probe) => <core.ProgressBar value={0.5} {...p(probe)} />,
  Breadcrumb: (probe) => <core.Breadcrumb items={[{ label: "Plant", href: "#/" }, { label: "Line 3" }]} {...p(probe)} />,
  Accordion: (probe) => <core.Accordion {...p(probe)} />,
  Splitter: (probe) => (
    <core.Splitter {...p(probe)}>
      <div>Trend</div>
      <div>Alarms</div>
    </core.Splitter>
  ),
  Stepper: (probe) => <core.Stepper steps={[{ label: "Drain" }, { label: "Clean" }]} current={0} {...p(probe)} />,
  FileInput: (probe) => <core.FileInput aria-label="Recipe file" {...p(probe)} />,
  AccordionItem: (probe) => (
    <core.Accordion>
      <core.AccordionItem value="a" title="General" {...p(probe)} />
    </core.Accordion>
  ),
};

/* Where P1 names a particular element, the element the ref reaches has to be
   that one - not merely some element that carries the four. */
const ROOT: Record<string, (element: Element) => boolean> = {
  Modal: (e) => e.tagName === "DIALOG",
  Drawer: (e) => e.tagName === "DIALOG",
  ConfirmDialog: (e) => e.tagName === "DIALOG",
  CommandPalette: (e) => e.tagName === "DIALOG",
  TreeView: (e) => e.getAttribute("role") === "tree",
  Combobox: (e) => e instanceof HTMLInputElement && e.getAttribute("role") === "combobox",
  MultiSelect: (e) => e instanceof HTMLButtonElement && e.getAttribute("aria-haspopup") === "dialog",
  DatePicker: (e) => e instanceof HTMLButtonElement && e.getAttribute("aria-haspopup") === "dialog",
  DateTimePicker: (e) => e instanceof HTMLButtonElement && e.getAttribute("aria-haspopup") === "dialog",
  DateRangePicker: (e) => e instanceof HTMLButtonElement && e.getAttribute("aria-haspopup") === "dialog",
  DateTimeRangePicker: (e) => e instanceof HTMLButtonElement && e.getAttribute("aria-haspopup") === "dialog",
};

/* The native fields that wear a wrapper: the ref and the rest reach the
   control itself - `name`, `value` and a form library's `register()` belong
   there - and the class dresses the wrapper around it, which is what a
   caller lays out. A decision of principle 1 from before this guard, kept. */
const CLASS_ON_WRAPPER: Record<string, string> = {
  FileInput: "the class on the drop zone around key, words and list, the rest on the file <input>",
  Checkbox: "the class on the label that holds box and text, the rest on the <input>",
  Input: "the class on the wrapper with the padding and the cross, the rest on the <input> (ADR-0041)",
  Textarea: "the class on the wrapper with the count, the rest on the <textarea> (ADR-0041)",
  TreeSearch: "an Input: the class on its wrapper, the rest on the <input>",
  NumberInput: "the class on the field with its stepper, the rest on the <input>",
  Select: "the class on the wrapper with the chevron, the rest on the <select>",
  SplitButton: "the class on the group, the rest on the main action",
  Slider: "the class on the wrapper with marks and readout, the rest on the range <input>",
  Combobox: "the class on the wrapper with the chevron, the rest on the input",
  MultiSelect: "the class on the field with the chips, the rest on the button that opens the panel",
  DatePicker: "the class on the wrapper with the cross, the rest on the trigger button",
  DateTimePicker: "the class on the wrapper with the cross, the rest on the trigger button",
  DateRangePicker: "the class on the wrapper with the cross, the rest on the trigger button",
  DateTimeRangePicker: "the class on the wrapper with the cross, the rest on the trigger button",
  Switch: "the checkbox's construction: the class on the label that holds track and text, the rest on the <input>",
};

/* The fields among them take the style where they take the class (ADR-0041):
   class and style are how a caller dresses and sizes what it lays out, and a
   width in `style` that reached the input inside sized the wrong element. The
   split button is no field and keeps its style on the main action. */
const shapeOf = (name: string): PassThroughCase["shape"] =>
  name === "SplitButton" ? "split" : name in CLASS_ON_WRAPPER ? "field" : "element";

passThroughGuard(
  "core",
  core,
  Object.fromEntries(
    Object.entries(CASES).map(([name, draw]) => [name, { render: draw, shape: shapeOf(name), root: ROOT[name] }]),
  ),
  EXCEPTIONS,
);

/* P3: what `...rest` may not override. The role and the aria attributes a
   component computes are what it has read; a caller's attribute of the same
   name would make it say something else than it shows. */
describe("What the rest may not override", () => {
  it("Stat keeps the name it has read and its role", () => {
    const foreign = { role: "note", "aria-label": "Other" } as object;
    const { container } = render(<core.Stat label="Temperature" value={21} unit="°C" {...foreign} />);
    const tile = container.firstElementChild!;
    expect(tile.getAttribute("role")).toBe("group");
    expect(tile.getAttribute("aria-label")).toBe("Temperature: 21 °C");
  });

  it("Meter keeps its role and value, and takes a caller's name", () => {
    const foreign = { role: "img", "aria-valuenow": 99 } as object;
    const { container } = render(<core.Meter value={0.4} aria-label="Load" {...foreign} />);
    const meter = container.firstElementChild!;
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("40");
    expect(meter.getAttribute("aria-label")).toBe("Load");
  });
});

/* The field shape in use: what a caller does with the rest of a combobox or a
   picker lands on the control that takes the focus. */
describe("The pickers are fields", () => {
  it("a test id on a Combobox finds the input, and typing filters", async () => {
    const { findAllByRole, getByTestId } = render(
      <core.Combobox
        data-testid="city"
        options={[{ value: "a", label: "Aachen" }, { value: "b", label: "Berlin" }]}
        value={null}
        onChange={noop}
      />,
    );
    const input = getByTestId("city") as HTMLInputElement;
    expect(input.getAttribute("role")).toBe("combobox");
    fireEvent.change(input, { target: { value: "Ber" } });
    expect(await findAllByRole("option")).toHaveLength(1);
  });

  it("an id on a DatePicker reaches the trigger, so a label names it", () => {
    const { getByLabelText } = render(
      <>
        <label htmlFor="d">Day</label>
        <core.DatePicker id="d" value={null} onChange={noop} />
      </>,
    );
    expect(getByLabelText("Day").getAttribute("aria-haspopup")).toBe("dialog");
  });
});

describe("The name is aria-label", () => {
  const roots: Leaf[] = [{ id: "one" }];
  function Tree(props: { name: object }) {
    const tree = core.useTree(roots, { reader });
    return (
      <core.TreeView tree={tree} {...(props.name as { "aria-label": string })}>
        {(e) => e.node.id}
      </core.TreeView>
    );
  }

  it("TreeView takes aria-label", () => {
    const named = render(<Tree name={{ "aria-label": "Files" }} />);
    expect(named.getByRole("tree").getAttribute("aria-label")).toBe("Files");
  });

  it("Popover and ContextMenu take aria-label", () => {
    const anchor = { current: document.body };
    const popover = render(
      <core.Popover open onOpenChange={noop} anchorRef={anchor} role="dialog" aria-label="Filter">
        x
      </core.Popover>,
    );
    expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Filter");
    popover.unmount();
    render(
      <core.ContextMenu open onOpenChange={noop} position={{ x: 1, y: 1 }} aria-label="Row">
        <core.MenuItem>Open</core.MenuItem>
      </core.ContextMenu>,
    );
    expect(document.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("Row");
  });
});
