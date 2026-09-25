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
        sentence: "Shows where the current page sits in a hierarchy and leads back up to any level above it (also called a trail or path). Where the trail runs out of room, its middle levels fold into a menu.",
        about: [
          "The last level is the current page: marked as such and not a link. Routing is yours: a level with an `href` alone is followed by the browser, one with `onSelect` runs your router instead.",
        ],
        alternatives: [
          { when: "The steps of a procedure, not places in a hierarchy", use: "stepper" },
          { when: "The whole hierarchy to browse, not the path to one place", use: "treeview" },
        ],
        keys: [
          { key: "Tab", action: "Moves through the levels, and to the button of the folded ones." },
          { key: "Enter", action: "Follows a level; on the button, opens the menu of folded levels." },
          { key: "Arrow Down / Arrow Up", action: "Walks the menu of folded levels." },
          { key: "Escape", action: "Closes the menu and returns the focus to its button." },
        ],
        limits: ["It neither routes nor reads the address: the trail is what you pass."],
        types: ["BreadcrumbProps", "BreadcrumbEntry"],
        exports: ["Breadcrumb"],
      },
      {
        id: "stepper",
        name: "Stepper",
        sentence: "Shows how far a procedure has come: which steps are done, which one is being worked on, which lie ahead and which failed (also called a progress tracker). Reach for it for approvals, rollouts and closing routines.",
        about: [
          "Each state is said as a word as well as drawn, so a screen reader hears \"done\", \"current step\", \"upcoming\" or \"failed\". A failed step stays failed when the procedure moves past it; past the last step, every step is done.",
        ],
        alternatives: [
          { when: "Progress as a share of a known amount, without named steps", use: "progressbar" },
          { when: "Where a page sits in a hierarchy", use: "breadcrumb" },
        ],
        limits: [
          "The steps are read, not navigated: no keys, no clicks, and no next or back of its own. Moving on is your application's decision.",
          "No branching or optional steps; pass the steps that apply.",
        ],
        types: ["StepperProps", "StepperStep"],
        exports: ["Stepper"],
      },
      {
        id: "tabs",
        name: "Tabs",
        sentence: "Several views of one thing in one place, exactly one of them visible (also called a tab bar). Reach for tabs when the views are alternatives the user switches between, not content to compare side by side.",
        about: [
          "Only the visible panel stands in the document; a hidden panel keeps no focus, scroll position or live region.",
          "Uncontrolled, the tabs keep the choice themselves. Controlled, they remember nothing, so the visible tab can come from the address.",
        ],
        alternatives: [
          { when: "Sections a reader may open several of at once", use: "accordion" },
          { when: "Two views the user needs side by side", use: "splitter" },
        ],
        keys: [
          { key: "Tab", action: "Moves onto the visible tab, then on into its panel." },
          { key: "Arrow Right / Arrow Left", action: "Shows the next or previous tab, wrapping at the ends." },
          { key: "Home / End", action: "Shows the first or the last tab." },
        ],
        limits: ["No scrolling or overflow menu for more tabs than fit, and no closing or reordering of tabs: keep the list short and fixed."],
        types: ["TabsProps", "TabProps", "TabPanelProps"],
        exports: ["Tabs", "TabList", "Tab", "TabPanel"],
      },
      {
        id: "accordion",
        name: "Accordion",
        sentence: "Long content in sections behind headers the user opens one or several at a time (also called collapsible sections). Reach for it where a reader needs a few of many sections, such as settings, a runbook or a report.",
        about: [
          "Each header is a button inside a heading; set the heading level that fits the page's outline. A folded section keeps its content and its fields' values, hidden and inert.",
        ],
        alternatives: [
          { when: "Alternative views of which exactly one shows", use: "tabs" },
          { when: "One block that folds on its own", use: "card" },
        ],
        keys: [
          { key: "Arrow Down / Arrow Up", action: "Moves to the next or previous header, wrapping and passing disabled ones." },
          { key: "Home / End", action: "Moves to the first or the last header." },
          { key: "Enter or Space", action: "Opens or folds the section." },
          { key: "Tab", action: "Moves into an open section's content; its fields keep their own keys." },
        ],
        limits: ["A folded section's content stays rendered; for heavy content, render it only while its section is open."],
        types: ["AccordionProps", "AccordionItemProps"],
        exports: ["Accordion", "AccordionItem"],
      },
      {
        id: "treeview",
        name: "TreeView",
        sentence: "A hierarchy the user expands, walks with the keys and optionally ticks (also called a tree or outline). Reach for it for folders, teams and cost-centre structures; large trees stay quick because only the visible rows are drawn.",
        about: [
          "`useTree` takes your data and a reader that says how to get a key, a label and the children; the tree owns only the view state over your data.",
          "The active node, where the keys are, and the checked nodes are two states, never one. A tick cascades down, a partly ticked branch shows as mixed, and a disabled node stays visible and walkable but is never ticked (ADR-0003, ADR-0005).",
          "Loading is yours: an unloaded branch reports that it was opened and shows that it is loading, and cascades and searches leave it alone until your data brings its children.",
        ],
        alternatives: [
          { when: "Only the path to the current place", use: "breadcrumb" },
          { when: "Rows with columns, grouped under headings", use: "`Table` with grouping from @umriss-ui/table" },
        ],
        keys: [
          { key: "Arrow Down / Arrow Up", action: "Moves to the next or previous visible node." },
          { key: "Arrow Right", action: "Expands the node; on an expanded one, moves to its first child." },
          { key: "Arrow Left", action: "Collapses the node; on a collapsed one, moves to its parent." },
          { key: "Home / End", action: "Moves to the first or the last visible node." },
          { key: "Enter", action: "Activates the node." },
          { key: "Space", action: "With checks: ticks or unticks the node." },
          { key: "Shift + Space", action: "With checks: ticks from the last ticked node to this one." },
          { key: "Shift + Arrow Down / Up", action: "With checks: moves and ticks in one gesture." },
          { key: "Ctrl + A", action: "With checks: ticks everything, or nothing if everything is ticked." },
          { key: "A letter", action: "Moves to the next node whose label starts with what was typed." },
        ],
        limits: [
          "No dragging nodes to rearrange them.",
          "It fetches nothing and handles no loading errors: retries and messages stay in your application (ADR-0005).",
        ],
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
