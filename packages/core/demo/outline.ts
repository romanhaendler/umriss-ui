/* The outline of the demo - in one place.

   It is data, not markup: the sidebar, the jump palette, the
   page head, the props tables and the screenshot suite all read from it. Two
   lists that mean the same thing drift apart.

   On naming. A page is called what a developer searches the component by - by
   its name and not by a category. Composite parts stand with their parent:
   `CardHeader` with `Card`, `SplitButton` with `ButtonGroup`. Whoever looks
   for `CardHeader` finds it where it is used anyway.

   On the address. It is single-segment: `#/button`. The rubric is
   deliberately NOT in it. A rubric sorts the sidebar and means nothing inside
   the library; were it in the address, every re-sorting of the sidebar would
   break every link (CONTEXT.md, "Rubric"). Component names are unique across
   the library, so one segment is enough.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else - a list beside them would be exactly
   the second truth this head argues against.

   On the cut. The rubrics of the demo rework (.scratch/demo-rework/spec.md):
   Getting started, Layout, Typography, Actions, Forms, Feedback, Overlays,
   Navigation and Data display, after the Scenarios page that opens the demo.
   Within a rubric the pages run from the simple to the composed and not
   alphabetically: an alphabet is an index, and the palette is already one
   (CONTEXT.md, "Rubric").

   The order follows the page, not taste: a sidebar sorted differently from
   what it jumps to confuses precisely when one trusts it. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What an application sets up once, before the first component.",
    pages: [
      {
        id: "umrissprovider",
        name: "UmrissProvider",
        sentence: "One place for density, portal target, toasts and language - and it stays optional, because every component already works without it.",
        types: ["UmrissProviderProps", "LanguageOptions"],
        exports: ["UmrissProvider", "LanguageProvider", "useWording", "useFormats"],
      },
    ],
  },
  {
    id: "layout",
    name: "Layout",
    sentence: "How a screen's parts are arranged, grouped and given room.",
    pages: [
      {
        id: "stack-and-grid",
        name: "Stack and Grid",
        sentence: "Lay a screen's parts out in a column, a row or a grid, spaced by the library's spacing steps instead of pixel numbers (flex and grid layout). Reach for them before a wrapper with margins of its own.",
        about: [
          "A gap is a step of the 4 px scale from 1 to 8, the same steps every component spaces itself by, so a screen keeps its proportions. `align` and `justify` pass `alignItems` and `justifyContent` through unchanged; for the rest of flexbox and grid, set `style`.",
        ],
        limits: ["No breakpoints and no responsive props: a grid follows the width through `minItemWidth`, anything else is your stylesheet's."],
        types: ["StackProps", "GridProps"],
        exports: ["Stack", "Grid"],
      },
      {
        id: "card",
        name: "Card",
        sentence: "A surface that holds one block of a screen together: a head with its title and actions, and a body (also called a panel or tile). Reach for it for each block of a dashboard or a detail view.",
        about: [
          "The line under the head is not the normal case; whitespace carries the hierarchy. Set it where the body runs edge to edge, a table or a log, together with a flush body.",
          "A collapsible card turns its head into the button for its body, with the state in the card or, controlled, in your application.",
        ],
        alternatives: [
          { when: "Many sections of one long content, opened one or several at a time", use: "accordion" },
          { when: "A line between two groups without a surface", use: "divider" },
        ],
        types: ["CardProps", "CardHeaderProps", "CardBodyProps"],
        exports: ["Card", "CardHeader", "CardBody"],
      },
      {
        id: "divider",
        name: "Divider",
        sentence: "A line between two groups of content, across or upright, that may name the part after it (also called a separator or rule).",
        alternatives: [{ when: "A group that needs a surface and a heading of its own", use: "card" }],
        types: ["DividerProps"],
        exports: ["Divider"],
      },
      {
        id: "splitter",
        name: "Splitter",
        sentence: "Two panes with a draggable line between them (also called a split view or resizable panels). Use it when the user needs both at once and decides how much of each: a list beside its detail, a chart above its alerts.",
        about: [
          "A splitter divides the room it is given and does not size it: give its box a height. For three panes, nest a splitter in one of the two.",
          "Name the separator after the pane it sizes, so a screen reader says \"Services, 35\" instead of the general name.",
        ],
        alternatives: [{ when: "Views the user switches between rather than sees together", use: "tabs" }],
        keys: [
          { key: "Arrow Left / Arrow Right", action: "Side by side: moves the line by one step, 5 % unless set otherwise." },
          { key: "Arrow Up / Arrow Down", action: "One above the other: moves the line by one step." },
          { key: "Home / End", action: "Moves the line to the smallest or the largest share." },
          { key: "Enter", action: "Folds the first pane to its smallest share; again, brings it back." },
        ],
        limits: [
          "Two panes per splitter, no more.",
          "It does not remember the share beyond its own life; keep it in the user's settings through `value` and `onChange`.",
        ],
        types: ["SplitterProps"],
        exports: ["Splitter"],
      },
      {
        id: "dock",
        name: "Dock",
        sentence: "A strip of tools that floats above one surface, a chart or a map, and rests at the edge the user moves it to (also called a floating toolbar). Reach for it when the tools act on that surface and must not take room from it.",
        about: [
          "It snaps and does not follow: dragging moves the handle, and the dock jumps to the edge whose zone the pointer reaches. It always rests at one of four places, never in between and never in a corner (ADR-0013).",
          "It belongs to one surface; two charts side by side have two docks. Which tools are modes is yours to say through `mode`; without it, every tool simply reports its use.",
          "Where an edge has no room for the strip, as the side edges of a wide, flat chart, that edge refuses visibly and shows the outline the dock would take. Nothing shrinks and nothing overflows.",
        ],
        alternatives: [{ when: "A toolbar standing in the flow above a table", use: "`Toolbar` from @umriss-ui/table" }],
        keys: [
          { key: "Tab", action: "Moves to the handle, then into the tools: one stop for all of them." },
          { key: "Arrow keys (on a tool)", action: "Moves to the next or previous tool, passing disabled ones." },
          { key: "Home / End (on a tool)", action: "Moves to the first or the last tool." },
          { key: "Enter or Space (on a tool)", action: "Takes the tool." },
          { key: "Arrow Up / Right / Down / Left (on the handle)", action: "Moves the dock to the top, right, bottom or left edge." },
          { key: "Escape (while dragging)", action: "Puts the dock back where the drag started." },
        ],
        limits: [
          "No free position and no corner: four resting places only (ADR-0013).",
          "No overflow menu and no shrinking; a dock with more tools than an edge holds is refused at that edge.",
          "It does not remember its place beyond its own life; keep it in the user's settings through `place`.",
        ],
        types: ["DockProps", "DockTool"],
        exports: ["Dock"],
      },
    ],
  },
  {
    id: "typography",
    name: "Typography",
    sentence: "The type a screen is set in.",
    pages: [
      {
        id: "typography",
        name: "Typography",
        sentence: "Text, Heading and Link - the three pieces every surface draws its type from.",
        types: ["TextProps", "HeadingProps", "LinkProps"],
        exports: ["Text", "Heading", "Link"],
      },
      {
        id: "visuallyhidden",
        name: "VisuallyHidden",
        sentence: "Text only the screen reader hears - and which becomes visible as soon as it takes focus.",
        types: ["VisuallyHiddenProps"],
        exports: ["VisuallyHidden"],
      },
    ],
  },
  {
    id: "actions",
    name: "Actions",
    sentence: "What a user presses when something is to happen.",
    pages: [
      {
        id: "button",
        name: "Button",
        sentence: "The button for one action - in four variants, two sizes, and with a loading state that disables itself.",
        types: ["ButtonProps"],
        exports: ["Button"],
      },
      {
        id: "buttongroup",
        name: "ButtonGroup",
        sentence: "Several buttons as one unit, and the SplitButton: a main action with a menu beside it.",
        types: ["ButtonGroupProps", "SplitButtonProps"],
        exports: ["ButtonGroup", "SplitButton"],
      },
    ],
  },
  {
    id: "forms",
    name: "Forms",
    sentence: "Where a user enters and picks values.",
    pages: [
      {
        id: "input",
        name: "Input",
        sentence: "The text field: two sizes, a numeric notation, and a clear button that appears only when there is content.",
        types: ["InputProps"],
        exports: ["Input"],
      },
      {
        id: "formfield",
        name: "FormField",
        sentence: "Label, hint and error around a field - and the wiring a screen reader needs.",
        types: ["FormFieldProps"],
        exports: ["FormField", "useFormField"],
      },
      {
        id: "textarea",
        name: "Textarea",
        sentence: "The text surface for several lines, optionally growing with its content and with a character counter.",
        types: ["TextareaProps"],
        exports: ["Textarea"],
      },
      {
        id: "numberinput",
        name: "NumberInput",
        sentence: "A number in German notation, clamped to its range, with arrow keys and a step.",
        types: ["NumberInputProps"],
        exports: ["NumberInput"],
      },
      {
        id: "checkbox",
        name: "Checkbox",
        sentence: "The check - with the third state a parent of partly checked children needs.",
        types: ["CheckboxProps"],
        exports: ["Checkbox"],
      },
      {
        id: "switch",
        name: "Switch",
        sentence: "On or off, taking effect at once - the checkbox's construction under the role a screen reader says as a switch.",
        types: ["SwitchProps"],
        exports: ["Switch"],
      },
      {
        id: "slider",
        name: "Slider",
        sentence: "A value set roughly between two bounds - the native range underneath, the keys of the slider pattern on every engine alike.",
        types: ["SliderProps"],
        exports: ["Slider"],
      },
      {
        id: "fileinput",
        name: "FileInput",
        sentence: "The platform's file input behind a key and a zone that takes a drop - the chosen files listed, sending them left to the application.",
        types: ["FileInputProps"],
        exports: ["FileInput"],
      },
      {
        id: "radiogroup",
        name: "RadioGroup",
        sentence: "A choice among few visible possibilities, with the keyboard model of a radio group.",
        types: ["RadioGroupProps", "RadioOption"],
        exports: ["RadioGroup"],
      },
      {
        id: "select",
        name: "Select",
        sentence: "The native select - right where the list is short and the system's own control is the better one.",
        types: ["SelectProps"],
        exports: ["Select"],
      },
      {
        id: "combobox",
        name: "Combobox",
        sentence: "A choice one types into: the list filters along, the value stays exactly one.",
        types: ["ComboboxProps", "ComboboxOption"],
        exports: ["Combobox"],
      },
      {
        id: "multiselect",
        name: "MultiSelect",
        sentence: "Several values as chips in the field, with a view that shows only the chosen ones.",
        types: ["MultiSelectProps", "MultiSelectOption"],
        exports: ["MultiSelect"],
      },
      {
        id: "datepicker",
        name: "DatePicker",
        sentence: "One date: typed or picked in the calendar, handed out as a `Date` at local midnight.",
        types: ["DatePickerProps"],
        exports: ["DatePicker"],
      },
      {
        id: "datetimepicker",
        name: "DateTimePicker",
        sentence: "One instant: date and time in one field, including the doubled hour at the clock change.",
        types: ["DateTimePickerProps"],
        exports: ["DateTimePicker"],
      },
      {
        id: "daterangepicker",
        name: "DateRangePicker",
        sentence: "A span of two days: presets, two months side by side, a preview on hover.",
        types: ["DateRangePickerProps"],
        exports: ["DateRangePicker"],
      },
      {
        id: "datetimerangepicker",
        name: "DateTimeRangePicker",
        sentence: "A span with times - for shifts and maintenance windows, with the duration in the footer.",
        types: ["DateTimeRangePickerProps"],
        exports: ["DateTimeRangePicker"],
      },
    ],
  },
  {
    id: "feedback",
    name: "Feedback",
    sentence: "What tells a user how things stand and that something is under way.",
    pages: [
      {
        id: "alert",
        name: "Alert",
        sentence: "A standing message in the flow of the page: tone, title, text and at most one action.",
        types: ["AlertProps"],
        exports: ["Alert"],
      },
      {
        id: "toast",
        name: "Toast",
        sentence: "A short piece of feedback at the edge: it interrupts nothing and goes away by itself.",
        types: ["ToastOptions"],
        exports: ["ToastProvider", "useToast"],
      },
      {
        id: "spinner",
        name: "Spinner",
        sentence: "The loading indicator `Button` uses itself - one size, one colour, nothing else.",
        types: ["SpinnerProps"],
        exports: ["Spinner"],
      },
      {
        id: "progressbar",
        name: "ProgressBar",
        sentence: "How far a task has come - or, without a value, that it runs; never a verdict, so never a tone.",
        types: ["ProgressBarProps"],
        exports: ["ProgressBar"],
      },
      {
        id: "skeleton",
        name: "Skeleton",
        sentence: "The placeholder for content still to come: it holds the height the content will have.",
        types: ["SkeletonProps"],
        exports: ["Skeleton"],
      },
      {
        id: "emptystate",
        name: "EmptyState",
        sentence: "What stands where there is nothing - with a sentence saying why, and a way forward.",
        types: ["EmptyStateProps"],
        exports: ["EmptyState"],
      },
    ],
  },
  {
    id: "overlays",
    name: "Overlays",
    sentence: "What opens above the screen and closes again.",
    pages: [
      {
        id: "tooltip",
        name: "Tooltip",
        sentence: "One sentence of explanation, on pointer contact and on keyboard focus - never the only source of a piece of information.",
        types: ["TooltipProps"],
        exports: ["Tooltip"],
      },
      {
        id: "popover",
        name: "Popover",
        sentence: "The seam under Menu, Tooltip, Select and the pickers: one placement, one dismissal, one focus model.",
        types: ["PopoverProps"],
        exports: ["Popover"],
      },
      {
        id: "menu",
        name: "Menu",
        sentence: "A list of actions under a trigger - not a select, but things that happen.",
        types: ["MenuProps", "MenuItemProps"],
        exports: ["Menu", "MenuItem", "MenuSeparator"],
      },
      {
        id: "contextmenu",
        name: "ContextMenu",
        sentence: "The same menu, opened at a point instead of under a trigger - for a right-click on something that is not a button.",
        types: ["ContextMenuProps"],
        exports: ["ContextMenu", "MenuItem", "MenuSeparator"],
      },
      {
        id: "modal",
        name: "Modal",
        sentence: "A window above the page that holds focus until it is answered.",
        types: ["ModalProps", "ModalHeaderProps"],
        exports: ["Modal", "ModalHeader", "ModalBody", "ModalFooter"],
      },
      {
        id: "drawer",
        name: "Drawer",
        sentence: "The same window, entering from an edge - a detail beside the page it came from.",
        types: ["DrawerProps"],
        exports: ["Drawer", "ModalHeader", "ModalBody", "ModalFooter"],
      },
      {
        id: "confirmdialog",
        name: "ConfirmDialog",
        sentence: "The one question before an action that cannot be taken back.",
        types: ["ConfirmDialogProps"],
        exports: ["ConfirmDialog"],
      },
      {
        id: "commandpalette",
        name: "CommandPalette",
        sentence: "Typing instead of searching: candidates by subsequence, with the matched characters in the accent.",
        types: ["CommandPaletteProps", "CommandPaletteItem"],
        exports: ["CommandPalette", "useCommandPaletteShortcut"],
      },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    sentence: "How a user finds their way through a screen and between screens.",
    pages: [
      {
        id: "breadcrumb",
        name: "Breadcrumb",
        sentence: "Where a page stands, from the plant down - and the way back up, folded into a menu where the place runs short.",
        types: ["BreadcrumbProps", "BreadcrumbEntry"],
        exports: ["Breadcrumb"],
      },
      {
        id: "stepper",
        name: "Stepper",
        sentence: "Where a procedure stands - done, current, upcoming or failed, each said as a word; moving on stays the caller's.",
        types: ["StepperProps", "StepperStep"],
        exports: ["Stepper"],
      },
      {
        id: "tabs",
        name: "Tabs",
        sentence: "Several views in one place, of which exactly one is visible.",
        types: ["TabsProps", "TabProps", "TabPanelProps"],
        exports: ["Tabs", "TabList", "Tab", "TabPanel"],
      },
      {
        id: "accordion",
        name: "Accordion",
        sentence: "Long content in sections behind headers - one open at a time, or several side by side.",
        types: ["AccordionProps", "AccordionItemProps"],
        exports: ["Accordion", "AccordionItem"],
      },
      {
        id: "treeview",
        name: "TreeView",
        sentence: "A tree with checks, keyboard control and virtualisation - built on a flat list.",
        types: ["TreeViewProps", "TreeSearchProps"],
        exports: ["TreeView", "TreeSearch", "useTree"],
      },
    ],
  },
  {
    id: "data-display",
    name: "Data display",
    sentence: "Single values and labels, read at a glance.",
    pages: [
      {
        id: "stat",
        name: "Stat",
        sentence: "A figure with an assessment, a history, a deviation from target, and a freshness independent of all of it.",
        types: ["StatProps"],
        exports: ["Stat", "useFreshness"],
      },
      {
        id: "meter",
        name: "Meter",
        sentence: "A bar for a fraction that draws its colour from an assessment and not from taste.",
        types: ["MeterProps"],
        exports: ["Meter"],
      },
      {
        id: "sparkline",
        name: "Sparkline",
        sentence: "A history at line height, without axes and without labels - the shape, not the value.",
        types: ["SparklineProps"],
        exports: ["Sparkline"],
      },
      {
        id: "badge",
        name: "Badge",
        sentence: "A number or a word at the edge of another element - small, quiet, and never telling on its own.",
        types: ["BadgeProps"],
        exports: ["Badge"],
      },
      {
        id: "tag",
        name: "Tag",
        sentence: "A short label on content - readable in every tone, removable where the caller allows it.",
        types: ["TagProps", "TagGroupProps"],
        exports: ["Tag", "TagGroup"],
      },
    ],
  },
];

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
