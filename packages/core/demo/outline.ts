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
    sentence: "The surfaces a screen is arranged on.",
    pages: [
      {
        id: "stack-and-grid",
        name: "Stack and Grid",
        sentence: "Spacing and grid as two shapes of one idea: layout out of tokens instead of out of numbers.",
        types: ["StackProps", "GridProps"],
        exports: ["Stack", "Grid"],
      },
      {
        id: "card",
        name: "Card",
        sentence: "The surface almost everything stands on: head, body and optionally a collapse mechanism.",
        types: ["CardProps", "CardHeaderProps", "CardBodyProps"],
        exports: ["Card", "CardHeader", "CardBody"],
      },
      {
        id: "divider",
        name: "Divider",
        sentence: "A separation between two things, horizontal or vertical, optionally with a label.",
        types: ["DividerProps"],
        exports: ["Divider"],
      },
      {
        id: "splitter",
        name: "Splitter",
        sentence: "Two panes and the line between them, moved by the pointer or the keys - a trend above its alarms, a list beside its detail.",
        types: ["SplitterProps"],
        exports: ["Splitter"],
      },
      {
        id: "dock",
        name: "Dock",
        sentence: "A strip of tools that floats above its surface and rests at one of its four edges.",
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
        sentence: "A single line of text (text field, text box): names, references, addresses, search terms. Reach for it whenever the answer is short free text; for numbers take a [NumberInput](#/numberinput).",
        about: [
          "Put it in a [FormField](#/formfield): the field brings the label, the hint, the error and the wiring a screen reader needs. Every attribute of the native input passes through.",
        ],
        alternatives: [
          { when: "A figure that is calculated with, with a unit and a range", use: "numberinput" },
          { when: "Text over several lines", use: "textarea" },
          { when: "One value out of a known list, found by typing", use: "combobox" },
        ],
        limits: [
          "No input masks or formatting while typing; check the value on leave or on submit.",
          "No validation of its own: the error is the application's, handed to the `FormField`.",
        ],
        types: ["InputProps"],
        exports: ["Input"],
      },
      {
        id: "formfield",
        name: "FormField",
        sentence: "The frame around a field: its label, a hint below it and the error that replaces the hint. Wrap every field in one, so the question, the help and the problem are read out together.",
        about: [
          "Every field of this rubric reads its id, description, invalid and required state from the surrounding `FormField`; an `error` marks the field invalid by itself. A control of your own gets the same through `useFormField`.",
          "`required` sets the mark and `aria-required`; it checks nothing. When and how a value is checked stays with the application.",
        ],
        limits: [
          "No form state, no validation rules, no submit handling: use your own state or a form library, and hand each message to its field.",
          "One field per `FormField`; a group of fields that share one label is a fieldset of your own.",
        ],
        types: ["FormFieldProps"],
        exports: ["FormField", "useFormField"],
      },
      {
        id: "textarea",
        name: "Textarea",
        sentence: "Text over several lines (multi-line text field): a comment, a summary, a note to the driver. It can grow with its text and count the characters left.",
        alternatives: [{ when: "A short answer on one line", use: "input" }],
        limits: ["Plain text only: no formatting, mentions or rich text."],
        types: ["TextareaProps"],
        exports: ["Textarea"],
      },
      {
        id: "numberinput",
        name: "NumberInput",
        sentence: "A number typed exactly (numeric field, spin box): an amount, a weight, hours. It shows the unit inside the field, keeps the value in its range and steps with the arrow keys.",
        about: [
          "The value is a number or `null`. An empty field is `null`, not zero: a figure nobody gave is not a figure of zero.",
          "It writes and reads the number in the notation of the formats, so German users get a decimal comma through `@umriss-ui/core/wording/de` (ADR-0024). Every value reported is already clamped to the range; the text in the field follows when it is left.",
        ],
        alternatives: [
          { when: "A value set roughly, where the position between two bounds matters more than the exact figure", use: "slider" },
          { when: "A code or reference that is never calculated with", use: "input" },
        ],
        keys: [
          { key: "Arrow Up / Arrow Down", action: "Steps the value up or down by one step." },
          { key: "Shift + Arrow Up / Down", action: "Steps by ten steps." },
        ],
        limits: ["No expressions: “12*4” is not calculated.", "No currency conversion; the unit is a label."],
        types: ["NumberInputProps"],
        exports: ["NumberInput"],
      },
      {
        id: "checkbox",
        name: "Checkbox",
        sentence: "A yes or no that counts when the form is saved (tick box). It also shows the mixed state of a parent whose children are partly checked.",
        about: [
          "The mixed state is derived, never stored: set it when some children are checked, and a click on the parent checks all or none.",
        ],
        alternatives: [
          { when: "A setting that takes effect the moment it flips", use: "switch" },
          { when: "One choice out of a few that exclude each other", use: "radiogroup" },
        ],
        keys: [{ key: "Space", action: "Checks or unchecks the focused box." }],
        types: ["CheckboxProps"],
        exports: ["Checkbox"],
      },
      {
        id: "switch",
        name: "Switch",
        sentence: "On or off, taking effect at once (toggle): paging at night, autoscaling, a feature for one service. A screen reader announces it as a switch, on or off.",
        alternatives: [{ when: "A choice that only counts after a Save button", use: "checkbox" }],
        keys: [{ key: "Space", action: "Turns the focused switch on or off." }],
        limits: ["No pending or loading state; while your application applies the change, disable the switch or say so beside it."],
        types: ["SwitchProps"],
        exports: ["Switch"],
      },
      {
        id: "slider",
        name: "Slider",
        sentence: "A value set roughly between two bounds (range slider): a share of traffic, an alert threshold, weekly hours. The position on the track says as much as the figure.",
        about: [
          "`onChange` reports a number already on the step and inside the bounds, by pointer and by key alike. Pair it with a [NumberInput](#/numberinput) on the same state when the exact figure matters too.",
        ],
        alternatives: [{ when: "An exact figure, or a range without sensible bounds", use: "numberinput" }],
        keys: [
          { key: "Arrow Right / Arrow Up", action: "Increases the value by one step." },
          { key: "Arrow Left / Arrow Down", action: "Decreases the value by one step." },
          { key: "Page Up / Page Down", action: "Moves by a tenth of the range." },
          { key: "Home / End", action: "Moves to the lower or upper bound." },
        ],
        limits: ["One thumb: no range with two ends.", "Marks show values; they do not catch the thumb."],
        types: ["SliderProps"],
        exports: ["Slider"],
      },
      {
        id: "fileinput",
        name: "FileInput",
        sentence: "Choose files from the system's dialog or drop them on the zone (file picker, upload field). The chosen files are listed with their size and can be removed one by one.",
        about: [
          "`accept` holds for the dialog and for a drop alike; a dropped file it refuses is named below the list instead of vanishing.",
          "It only chooses. Reading, checking and uploading the files are the application's.",
        ],
        keys: [{ key: "Space or Enter", action: "Opens the system's file dialog." }],
        limits: ["No upload, no progress and no size limit of its own; those belong to the application sending the files."],
        types: ["FileInputProps"],
        exports: ["FileInput"],
      },
      {
        id: "radiogroup",
        name: "RadioGroup",
        sentence: "One choice out of a few that all stay in view (radio buttons, option group). Each option may carry a sentence that explains it.",
        about: ["The group is one tab stop; the arrow keys move and choose at once, skipping disabled options, which stay visible."],
        alternatives: [
          { when: "More than about five options, or options that need no explanation", use: "select" },
          { when: "A single yes or no", use: "checkbox" },
          { when: "Several options at once", use: "multiselect" },
        ],
        keys: [
          { key: "Tab", action: "Moves into the group, onto the chosen option, and out again." },
          { key: "Arrow Down / Arrow Right", action: "Chooses the next option, wrapping at the end." },
          { key: "Arrow Up / Arrow Left", action: "Chooses the previous option." },
        ],
        types: ["RadioGroupProps", "RadioOption"],
        exports: ["RadioGroup"],
      },
      {
        id: "select",
        name: "Select",
        sentence: "One choice from a short, known list (dropdown), shown with the system's own control: a wheel on the phone, the keyboard on the desktop.",
        alternatives: [
          { when: "A long list that is searched by typing", use: "combobox" },
          { when: "Several values at once", use: "multiselect" },
          { when: "A few options that should all stay in view or need a sentence each", use: "radiogroup" },
        ],
        keys: [
          { key: "Arrow Up / Arrow Down", action: "Changes the choice, or moves in the open list." },
          { key: "Space or Alt + Arrow Down", action: "Opens the list (as the system does)." },
          { key: "Typing a letter", action: "Jumps to the next option starting with it." },
        ],
        limits: ["The open list is the system's: no icons, descriptions or search inside it."],
        types: ["SelectProps"],
        exports: ["Select"],
      },
      {
        id: "combobox",
        name: "Combobox",
        sentence: "One choice from a long list, found by typing (autocomplete, searchable select): a driver, a service, an account. The list filters along while the value stays exactly one.",
        about: [
          "What is typed is a search term, not a value: the value changes only when a row is chosen or the field is cleared, and it is one option or `null`.",
          "The list keeps its given order while it filters; sort the options before you pass them if you want an order.",
        ],
        alternatives: [
          { when: "A short list, better served by the system's own control", use: "select" },
          { when: "Several values at once", use: "multiselect" },
        ],
        keys: [
          { key: "Arrow Down / Arrow Up", action: "Opens the list, then moves through the rows." },
          { key: "Enter", action: "Chooses the active row." },
          { key: "Escape", action: "Closes the list." },
        ],
        limits: ["No free text as a value: only an option can be chosen.", "No loading of options from a server; filter your own list and pass it in."],
        types: ["ComboboxProps", "ComboboxOption"],
        exports: ["Combobox"],
      },
      {
        id: "multiselect",
        name: "MultiSelect",
        sentence: "Several values from a list (multi-select, tag picker): a project team, services to filter by. The chosen ones stand as chips in the field, with a view in the panel that shows only them.",
        about: [
          "The field stays one line tall: as many chips as fit, the rest as a “+N” button that opens the panel on the chosen values.",
          "The panel has a search, select all, select none and invert for what the search found, and it never reorders the list.",
        ],
        alternatives: [
          { when: "Exactly one value", use: "combobox" },
          { when: "A few options that should all stay in view", use: "checkbox" },
        ],
        keys: [
          { key: "Arrow Left / Arrow Right", action: "Moves across the chips and the “+N” button in the field." },
          { key: "Backspace", action: "On the field, removes the last chosen value; on a chip, removes that chip (so does Delete)." },
          { key: "Arrow Down / Arrow Up", action: "In the panel, moves between the search and the rows." },
          { key: "Enter", action: "In the search, ticks or unticks the first row found." },
          { key: "Space", action: "Ticks or unticks the focused row." },
          { key: "Escape", action: "Closes the panel." },
        ],
        types: ["MultiSelectProps", "MultiSelectOption"],
        exports: ["MultiSelect"],
      },
      {
        id: "datepicker",
        name: "DatePicker",
        sentence: "One day, picked in a calendar (date field): a delivery date, a due date. Weeks begin on Monday.",
        about: [
          "The value contract of the four pickers stands here. `DatePicker` hands out a `Date` at local midnight on every path and reports as soon as the day is chosen. [DateTimePicker](#/datetimepicker) hands out an instant and reports only on Apply, Now or Clear. [DateRangePicker](#/daterangepicker) gives both ends at local midnight, both inclusive. [DateTimeRangePicker](#/datetimerangepicker) sets an all-day end to the end of the day, not to its midnight.",
          "`null` means no date, never 1 January 1970. A range never comes out backwards: ends picked in reverse are swapped, so there is no error state to handle. A time that falls into a clock change is named in the panel, never guessed: a skipped hour moves forward, and a doubled hour asks which of the two.",
        ],
        alternatives: [
          { when: "A day and a time of day", use: "datetimepicker" },
          { when: "A span of days", use: "daterangepicker" },
          { when: "A span with times at both ends", use: "datetimerangepicker" },
        ],
        keys: [
          { key: "Enter or Space", action: "On the field, opens the calendar; on a day, chooses it." },
          { key: "Arrow keys", action: "Move a day left or right, a week up or down." },
          { key: "Escape", action: "Closes the calendar and returns to the field." },
        ],
        limits: ["No typing of a date into the field.", "No time zones other than the browser's."],
        types: ["DatePickerProps"],
        exports: ["DatePicker"],
      },
      {
        id: "datetimepicker",
        name: "DateTimePicker",
        sentence: "One moment, day and time of day in one field (date-time field): when an incident began, when an alert fired.",
        about: [
          "It reports only on Apply, Now or Clear, never with a day that has no time yet. The value contract of the pickers stands on [DatePicker](#/datepicker).",
          "Around a clock change the panel names a skipped hour and asks which of a doubled hour is meant, for example 02:30 on 25 October 2026.",
        ],
        alternatives: [
          { when: "A day without a time", use: "datepicker" },
          { when: "A span with times at both ends", use: "datetimerangepicker" },
        ],
        keys: [
          { key: "Arrow keys", action: "In the calendar, move a day or a week." },
          { key: "Enter or Space", action: "On a day, chooses it and moves on to the hour." },
          { key: "Arrow Up / Arrow Down", action: "In a time field, steps the hour, minute or second." },
          { key: "Enter", action: "In a time field, applies the value." },
          { key: "Escape", action: "Closes the panel without a change." },
        ],
        limits: ["No time zones other than the browser's."],
        types: ["DateTimePickerProps"],
        exports: ["DateTimePicker"],
      },
      {
        id: "daterangepicker",
        name: "DateRangePicker",
        sentence: "A span of days, from one day to another (date range): leave, a sprint, a reporting period. Two months side by side, presets for the usual spans, and the days counted while the pointer moves.",
        about: [
          "Both ends lie at local midnight and both count. The value contract of the pickers stands on [DatePicker](#/datepicker).",
          "The same `{ from, to }` shape is what `@umriss-ui/table` reads a date filter from.",
        ],
        alternatives: [
          { when: "A span with times at both ends", use: "datetimerangepicker" },
          { when: "A single day", use: "datepicker" },
        ],
        keys: [
          { key: "Arrow keys", action: "Move a day or a week, across both months." },
          { key: "Enter or Space", action: "Sets the start, then the end." },
          { key: "Escape", action: "Closes the panel." },
        ],
        limits: ["One span; no list of separate days."],
        types: ["DateRangePickerProps"],
        exports: ["DateRangePicker"],
      },
      {
        id: "datetimerangepicker",
        name: "DateTimeRangePicker",
        sentence: "A span with a time at each end (date-time range): a planned downtime, a release freeze, the minutes an objective was breached. The footer shows the duration while it is set.",
        about: [
          "It starts on All day: two clicks set the days, from 00:00 to the end of the last day. Untick All day to type the times. It reports only on Apply. The value contract of the pickers stands on [DatePicker](#/datepicker).",
          "A clock change is named for each end separately.",
        ],
        alternatives: [
          { when: "Whole days only", use: "daterangepicker" },
          { when: "A single moment", use: "datetimepicker" },
        ],
        keys: [
          { key: "Arrow keys", action: "In the calendar, move a day or a week." },
          { key: "Enter or Space", action: "Sets the start day, then the end day." },
          { key: "Arrow Up / Arrow Down", action: "In a time field, steps its value." },
          { key: "Enter", action: "In a time field, applies the span." },
          { key: "Escape", action: "Closes the panel without a change." },
        ],
        limits: ["No time zones other than the browser's.", "No recurring windows."],
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
  {
    /* The one rubric that is not about a component of this package: every
       package on one page, as a consumer combines them (control-room-demo,
       R1). Here and not a sixth demo, because the core demo is the one a
       reader opens first. It stands last: it is the summary, not the way in. */
    id: "control-room",
    name: "Control room",
    sentence: "Every package on one page, fed by one plant - the shared vocabulary at a glance.",
    pages: [
      {
        id: "control-room",
        name: "Control room",
        sentence: "A kiln line over a shift: the limit crossed in the trend is the alarm in the list, the verdict on the tile and the scrap in the OEE.",
        types: [],
        exports: ["Stat", "Drawer", "ProgressBar"],
      },
    ],
  },
];

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
