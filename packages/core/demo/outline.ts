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
        id: "installation",
        name: "Installation",
        sentence: "What an application does once before its first component: install the package, choose the fonts and let light and dark follow the page. The styles load themselves, and no provider is needed.",
        about: [
          "Install with `pnpm add @umriss-ui/core` (React 18 or newer). Importing a component brings its stylesheet along; `@umriss-ui/core/styles.css` stays exported for setups that link stylesheets by hand. The styles touch nothing outside the components: no rule on `html`, `body` or `*` (ADR-0021).",
          "Every token is a `--u-…` custom property in the cascade layer `umriss.tokens`, so CSS written outside a layer overrides it. The fonts are the application's: the tokens name Geist first and fall back to the system fonts, and nothing is loaded. For Geist, install `@fontsource/geist-sans` (400, 500, 600) and `@fontsource/geist-mono` (400).",
          "Light and dark follow the application's `color-scheme`, since every two-valued token is written `light-dark(…)`. Nothing set means light; one part of a page can be dark on its own.",
        ],
        limits: [
          "No theme object and no theme switch: the mode is the page's `color-scheme` (ADR-0021).",
          "No font is loaded or bundled.",
          "Chrome 123, Firefox 120 and Safari 17.5 or newer; an older browser discards the tokens and shows the components unstyled.",
        ],
        types: [],
        exports: [],
      },
      {
        id: "umrissprovider",
        name: "UmrissProvider",
        sentence: "Sets once, at the root, what an application shares: the density of its tables, where overlays open, how long toasts stay and the language. It is optional; every component works the same without it.",
        about: [
          "It holds these four settings and nothing else: no theme (see [Installation](#/installation)) and no defaults for a component's own props. It writes nothing onto the document.",
          "Keep the objects you pass outside the component or memoised: a new object on every render is a new setting on every render.",
        ],
        alternatives: [
          { when: "Only the wording or the formats of one section differ", use: "language" },
        ],
        limits: ["No theme and no default variants for components: a component is configured by its own props."],
        types: ["UmrissProviderProps"],
        exports: ["UmrissProvider"],
      },
      {
        id: "language",
        name: "Language",
        sentence: "The words and the number and date notation the components write themselves: English by default, German in one import, and any single entry your own. Wording is a directory of named entries, not a translation call (also called i18n or localisation).",
        about: [
          "English needs nothing (ADR-0018). German ships as the subpath `@umriss-ui/core/wording/de` with `GERMAN_WORDING` and `GERMAN_FORMATS`, the two halves of a language; take both in one import (ADR-0019, ADR-0024).",
          "Pass them to the `language` of [UmrissProvider](#/umrissprovider) for the application, or to `LanguageProvider` for one section. Both merge entry by entry: what you leave out keeps its default. Every wording is typed `Wording`, so a whole language of your own misses no entry without a compile error.",
        ],
        alternatives: [
          { when: "The application also sets a density, a portal target or toasts", use: "umrissprovider" },
        ],
        limits: [
          "Two languages ship; a third is a `Wording` object of your own. No right-to-left (ADR-0032).",
          "It holds only what the components say themselves; your labels, titles and data are yours to translate.",
        ],
        types: ["LanguageOptions"],
        exports: ["LanguageProvider", "useWording", "useFormats"],
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
        sentence: "Sets paragraphs, headings and links on the library's type scale, so a screen of your own reads like the components around it. Reach for it wherever you would otherwise style text by hand.",
        about: [
          "A heading's outline level and its size are independent: choose the level for the page's structure, the size for the eye.",
          "`Text` renders a `p`; inside a line, render it `as` a `span`.",
        ],
        alternatives: [
          { when: "Text only a screen reader should hear", use: "visuallyhidden" },
          { when: "A figure read against its limits, with unit and verdict", use: "stat" },
          { when: "A short status word in colour", use: "badge" },
        ],
        limits: [
          "No truncation and no line length: both depend on the column, which only the application knows.",
          "No prose styles for lists, quotes or rich text (ADR-0032).",
          "`Link` renders a plain `a` and knows no router; pass it the address your router resolves.",
        ],
        types: ["TextProps", "HeadingProps", "LinkProps"],
        exports: ["Text", "Heading", "Link"],
      },
      {
        id: "visuallyhidden",
        name: "VisuallyHidden",
        sentence: "Text a screen reader announces but the eye does not see (also called screen-reader-only or sr-only). Reach for it when a visible label is clear from its surroundings but not on its own, and for a skip link.",
        alternatives: [
          { when: "A hint every user should be able to see", use: "tooltip" },
          { when: "A button that shows only an icon", use: "an `aria-label` on the button" },
        ],
        keys: [{ key: "Tab", action: "Reaches a `focusable` one and shows it while it has focus." }],
        limits: ["It hides from the eye only; to hide something from everyone, do not render it."],
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
        sentence: "Starts one action when pressed: save, send, deploy, delete. Its variant says how much weight the action carries beside its neighbours, and while the action runs it shows that it is busy and cannot be pressed twice.",
        about: [
          "Use the primary variant once per surface, and danger only for what cannot be undone.",
          "A loading button locks itself and tells assistive technology it is busy; it needs no `disabled` beside it. A button is `type=\"button\"` unless you set another type, so it never sends a form by accident.",
        ],
        alternatives: [
          { when: "Several buttons that act on the same thing", use: "buttongroup" },
          { when: "One main action with rarer variants", use: "buttongroup" },
          { when: "Going to another page rather than doing something", use: "typography" },
          { when: "A setting that is on or off", use: "switch" },
        ],
        limits: [
          "The label stays on one line; keep it short rather than let it wrap.",
          "No icon slot and no icon-only variant: an SVG goes among the children, and an icon-only button needs an `aria-label`.",
        ],
        types: ["ButtonProps"],
        exports: ["Button"],
      },
      {
        id: "buttongroup",
        name: "ButtonGroup",
        sentence: "Joins buttons that act on the same thing into one control. Its companion SplitButton runs one main action and keeps the rarer variants in a menu beside it (also called a dropdown or menu button).",
        about: [
          "Name every group with an `aria-label`; a screen reader otherwise announces only \"group\". Each button in it stays its own Tab stop.",
          "A group holds no selection: it does not remember which button was pressed.",
        ],
        alternatives: [
          { when: "One option out of a few that stays chosen", use: "radiogroup" },
          { when: "Several views of one place", use: "tabs" },
          { when: "Many actions and none of them the main one", use: "menu" },
        ],
        keys: [
          { key: "Tab", action: "Moves to the next button; on a split button, from the main action to the menu trigger." },
          { key: "Enter / Space", action: "Presses the focused button; on the trigger, opens the menu and focuses its first entry." },
          { key: "↓ / ↑", action: "Moves through the open menu's entries." },
          { key: "Home / End", action: "Jumps to the first or last entry." },
          { key: "Escape", action: "Closes the menu and returns focus to the trigger." },
        ],
        limits: ["No toggle or segmented state; a choice that stays is a radio group."],
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
