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
        sentence: "A message that stays in the page until its matter is settled (also called a banner or callout). Reach for it when the reader must notice something here: a failed import, an approval waiting, a form that did not save.",
        about: [
          "`warning` and `danger` interrupt a screen reader at once; `neutral`, `accent` and `success` are read out politely when the reader is free. Choose the tone by what the reader has to do, not by the colour you want.",
          "Dismissing is reported through `onDismiss` and nothing more: whether and when the message comes back is your state.",
        ],
        alternatives: [
          { when: "Confirming something that has already happened, which may pass unnoticed", use: "toast" },
          { when: "A question the user must answer before an action goes ahead", use: "confirmdialog" },
          { when: "A list or panel with nothing in it", use: "emptystate" },
        ],
        limits: [
          "No timer: an alert stays until you remove it. A message that goes by itself is a toast.",
          "No stack or queue of messages; place each alert where its matter is.",
        ],
        types: ["AlertProps"],
        exports: ["Alert"],
      },
      {
        id: "toast",
        name: "Toast",
        sentence: "Short feedback in the corner of the window that interrupts nothing and goes away by itself (also called a snackbar or notification). Reach for it to confirm what has just happened: saved, exported, approved.",
        about: [
          "`useToast` needs a `ToastProvider` around the application, once, at the root.",
          "A toast stays five seconds by default. Its clock stops while the pointer rests on it and runs on with the time that was left.",
          "Nothing that must be read goes in a toast: whoever looked elsewhere has missed it. `duration: 0` keeps one until it is closed – for the rare message whose loss costs something, since a corner full of standing toasts stops being read.",
        ],
        alternatives: [
          { when: "The reader must see it, or it stays true until something is done", use: "alert" },
          { when: "The reader must decide before going on", use: "confirmdialog" },
        ],
        limits: [
          "No buttons inside a toast: what needs a decision needs an [Alert](#/alert) or a [ConfirmDialog](#/confirmdialog).",
          "No choice of position: the stack stands in the bottom right corner of the window.",
        ],
        types: ["ToastOptions"],
        exports: ["ToastProvider", "useToast"],
      },
      {
        id: "spinner",
        name: "Spinner",
        sentence: "A turning circle that says something is running, without saying how far (also called a loading indicator). Reach for it for short waits whose length nobody knows, beside a word that says what runs.",
        about: [
          "It takes the colour of the text around it and announces itself as “Loading”; name it better with `aria-label` where the word beside it is not enough.",
        ],
        alternatives: [
          { when: "You know how far the job has come", use: "progressbar" },
          { when: "You know the shape of the content that is coming", use: "skeleton" },
          { when: "A button waiting for the action it started", use: "`loading` on [Button](#/button)" },
        ],
        limits: ["One shape and no figure: for how far a job has come, use a [ProgressBar](#/progressbar)."],
        types: ["SpinnerProps"],
        exports: ["Spinner"],
      },
      {
        id: "progressbar",
        name: "ProgressBar",
        sentence: "A bar that shows how far a job has come, or that it runs while nobody knows how far (also called a progress indicator). Reach for it for imports, uploads and anything else that counts towards an end.",
        about: [
          "`value` runs from 0 to 1; values outside are clamped. A screen reader hears the percentage, or `valueText` where a count says it better.",
          "It has no tone: progress is neither good nor bad, and a job at 90 % is not a warning.",
        ],
        alternatives: [
          { when: "A measured share read against a bound: utilisation, budget used", use: "meter" },
          { when: "A short wait with nothing to count", use: "spinner" },
        ],
        limits: ["No colour of verdict and no steps of its own; for a job in steps, stack one bar per step."],
        types: ["ProgressBarProps"],
        exports: ["ProgressBar"],
      },
      {
        id: "skeleton",
        name: "Skeleton",
        sentence: "Grey shapes that stand where content is still loading and hold the height it will have (also called a placeholder or shimmer). Reach for it when you know the layout of what is coming, so nothing jumps when it arrives.",
        about: [
          "A skeleton is hidden from screen readers. Mark the region that is loading with `aria-busy`, and say in words what loads where that matters.",
        ],
        alternatives: [
          { when: "The layout of what is coming is unknown", use: "spinner" },
          { when: "You can say how far the loading has come", use: "progressbar" },
        ],
        limits: ["It draws a shape and nothing else; the rows, cards and layout it stands in for are yours."],
        types: ["SkeletonProps"],
        exports: ["Skeleton"],
      },
      {
        id: "emptystate",
        name: "EmptyState",
        sentence: "What stands where a list or panel has nothing to show: what is missing, why, and the way forward (also called a blank slate). Reach for it for a first use, a filter that found nothing, or a queue that is clear.",
        alternatives: [
          { when: "Something went wrong and the reader must act", use: "alert" },
          { when: "The content is still loading", use: "skeleton" },
        ],
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
        sentence: "A sentence of explanation that appears while the pointer rests on an element or the keyboard focus is on it (also called a hint). Reach for it to name an icon button or explain an abbreviation.",
        about: [
          "It wraps exactly one element that can take focus and a ref; on text, give a `span` a `tabIndex` of 0.",
          "Anything that stands only in a tooltip is lost on a touch screen. Keep it to a sentence that repeats or explains what is already there.",
        ],
        alternatives: [
          { when: "The content has a link, a button or more than a sentence", use: "popover" },
          { when: "The reader must see it without hovering", use: "Plain text beside the element" },
        ],
        keys: [
          { key: "Tab", action: "Focusing the element shows its tooltip; moving focus away hides it." },
          { key: "Escape", action: "Hides the tooltip." },
        ],
        limits: [
          "No interactive content and no rich layout inside: it is read, never used.",
          "No placement option: it stands above its element and flips below where there is no room.",
        ],
        types: ["TooltipProps"],
        exports: ["Tooltip"],
      },
      {
        id: "popover",
        name: "Popover",
        sentence: "A surface that hangs from a trigger and closes on Escape, an outside click or scrolling (also called a flyout or dropdown panel). Reach for it for a small panel of your own: a filter, a detail, a short form.",
        about: [
          "It is controlled: you hold `open`, and `onOpenChange` reports each wish to close. Only you know whether it may close now, for instance with a half-filled form in it.",
          "It places itself below its anchor, flips above where there is no room and stays inside the window. Inside a dialog it portals into that dialog, so it never lands behind it.",
          "`Menu`, `Tooltip`, `Select`, `Combobox`, `MultiSelect` and the pickers stand on it, so they all place and dismiss the same way.",
        ],
        alternatives: [
          { when: "A list of actions", use: "menu" },
          { when: "A sentence of explanation", use: "tooltip" },
          { when: "The user must answer before going on", use: "modal" },
        ],
        keys: [
          { key: "Escape", action: "Asks to close; with `restoreFocus` the focus returns to the trigger." },
        ],
        limits: [
          "No look of its own: background, radius and shadow are yours, so each surface built on it keeps its own.",
          "It does not trap focus; a surface the user must answer is a [Modal](#/modal).",
        ],
        types: ["PopoverProps"],
        exports: ["Popover"],
      },
      {
        id: "menu",
        name: "Menu",
        sentence: "A list of actions that opens under a button (also called a dropdown menu). Reach for it when a place has more actions than room for buttons, or for the actions of each row in a list.",
        about: [
          "The entries are things that happen, not values that stay; choosing one runs it and closes the menu so the result is in view.",
          "An icon-only trigger needs an `aria-label` that says what it acts on, such as “Actions for INC-1048”.",
        ],
        alternatives: [
          { when: "The user chooses a value that stays", use: "select" },
          { when: "The actions belong to a point or a row that is right-clicked", use: "contextmenu" },
          { when: "Two or three actions that fit as buttons", use: "buttongroup" },
          { when: "Many commands across the application, found by typing", use: "commandpalette" },
        ],
        keys: [
          { key: "Enter or Space", action: "On the trigger, opens the menu and moves focus to the first entry; on an entry, runs it and closes the menu." },
          { key: "↓ / ↑", action: "Moves to the next or previous entry, wrapping at the ends; disabled entries are skipped." },
          { key: "Home / End", action: "Moves to the first or last entry." },
          { key: "Escape", action: "Closes the menu and returns focus to the trigger." },
          { key: "Tab", action: "Closes the menu and moves on from the trigger." },
        ],
        limits: [
          "No submenus, no checkable entries and no type-ahead.",
        ],
        types: ["MenuProps", "MenuItemProps"],
        exports: ["Menu", "MenuItem", "MenuSeparator"],
      },
      {
        id: "contextmenu",
        name: "ContextMenu",
        sentence: "A menu that opens at a point, for a right-click on something that is not a button: a row, a canvas, a bar in a schedule (also called a right-click menu). The entries and the keyboard are those of the menu.",
        about: [
          "It is controlled: on `contextmenu` you keep the point and open it there, and `onOpenChange` reports the wish to close. Focus goes to the first entry and back to where it was on closing.",
          "A right-click is invisible to a keyboard. Open the same menu on Shift+F10 or the menu key at the focused element, and keep the actions reachable some other way too.",
        ],
        alternatives: [
          { when: "The actions have a visible trigger", use: "menu" },
        ],
        keys: [
          { key: "↓ / ↑", action: "Moves to the next or previous entry, wrapping at the ends; disabled entries are skipped." },
          { key: "Home / End", action: "Moves to the first or last entry." },
          { key: "Escape", action: "Closes the menu and returns focus to where it was." },
          { key: "Enter or Space", action: "Runs the focused entry and closes the menu." },
          { key: "Shift+F10 or the menu key", action: "Opens the menu where you listen for them, as the row example does." },
        ],
        limits: [
          "It listens to no right-click itself: the element that is clicked is yours, and so is the point.",
          "No submenus, no checkable entries and no type-ahead, as in the menu.",
        ],
        types: ["ContextMenuProps"],
        exports: ["ContextMenu", "MenuItem", "MenuSeparator"],
      },
      {
        id: "modal",
        name: "Modal",
        sentence: "A window above the page that holds the focus until it is answered or closed (also called a dialog). Reach for it for a short task that interrupts the page: create an item, edit its settings, read a policy.",
        about: [
          "It is controlled: you hold `open`, and `onClose` reports Escape, the cross and a click on the backdrop. Whether it closes is yours, so a window with unsaved edits can ask first.",
          "The title in `ModalHeader` names the dialog for a screen reader. The height follows the content; where it does not fit, only `ModalBody` scrolls.",
          "It is the browser's modal dialog: focus stays inside, the page behind cannot be scrolled, and focus returns to the opener on closing.",
        ],
        alternatives: [
          { when: "A detail beside the list the user came from", use: "drawer" },
          { when: "One yes-or-no before something that cannot be undone", use: "confirmdialog" },
          { when: "A small panel that should not block the page", use: "popover" },
        ],
        keys: [
          { key: "Tab / Shift+Tab", action: "Moves between the controls inside; focus does not leave the window." },
          { key: "Escape", action: "Asks to close: `onClose` is called, and the window goes when you close it." },
        ],
        limits: [
          "No non-modal window and no dragging or resizing: a panel that leaves the page usable is layout – a [Splitter](#/splitter) or a [Dock](#/dock).",
        ],
        types: ["ModalProps", "ModalHeaderProps"],
        exports: ["Modal", "ModalHeader", "ModalBody", "ModalFooter"],
      },
      {
        id: "drawer",
        name: "Drawer",
        sentence: "A modal window that slides in from the left or right edge of the screen (also called a side sheet). Reach for it for the detail of something picked from a list, while the list stays in sight behind it.",
        about: [
          "Everything the modal promises holds: the focus stays inside, Escape and a click beside it ask to close, and the focus returns to the button that opened it. Header, body and footer are the modal's parts.",
          "Its width is the token `--u-drawer-width`: set it once for the application, or in one drawer's `style` where it needs more room.",
        ],
        alternatives: [
          { when: "A task that has nothing to do with what lies behind it", use: "modal" },
          { when: "A side panel that stays open while the page is used", use: "splitter" },
        ],
        keys: [
          { key: "Tab / Shift+Tab", action: "Moves between the controls inside; focus does not leave the window." },
          { key: "Escape", action: "Asks to close: `onClose` is called, and the window goes when you close it." },
        ],
        limits: [
          "Modal on purpose, with no non-modal mode: a panel beside a page the user keeps working in is layout, not an overlay.",
          "Only the left and right edges; nothing slides in from the top or bottom.",
        ],
        types: ["DrawerProps"],
        exports: ["Drawer", "ModalHeader", "ModalBody", "ModalFooter"],
      },
      {
        id: "confirmdialog",
        name: "ConfirmDialog",
        sentence: "A small modal window with one question and two buttons, for the moment before something that cannot be undone (also called a confirmation). Reach for it before deleting, rejecting or closing for good.",
        about: [
          "Use it only where the step cannot be taken back: a question before every action gets clicked away, and then it no longer protects the one that mattered.",
          "It does not close itself on `onConfirm`, so you can show `loading` while the request runs. Cancelling, by Escape, the cross or the second button, calls `onClose`.",
        ],
        alternatives: [
          { when: "The user fills in fields before confirming", use: "modal" },
          { when: "The action can be undone afterwards", use: "Do it, and confirm it with a [Toast](#/toast)" },
        ],
        keys: [
          { key: "Tab / Shift+Tab", action: "Moves between the controls inside; focus does not leave the window." },
          { key: "Escape", action: "Asks to close: `onClose` is called, and the window goes when you close it." },
          { key: "Enter or Space", action: "Presses the focused button." },
        ],
        limits: [
          "A title, a description and two buttons, nothing more: fields belong in a [Modal](#/modal).",
        ],
        types: ["ConfirmDialogProps"],
        exports: ["ConfirmDialog"],
      },
      {
        id: "commandpalette",
        name: "CommandPalette",
        sentence: "A search field above the page that finds commands and places as you type (also called a command menu or quick switcher). Reach for it when an application has more actions and pages than any menu can show.",
        about: [
          "It matches by subsequence, not by substring: “ack” finds “Acknowledge the alert”, and the matched letters are marked so an unexpected find explains itself. A candidate's group is searched too.",
          "A candidate is an id, a label and a group; what happens on choosing is yours, so pages and commands live in one list.",
          "Without `restingItems` the empty palette is only the field. The library keeps no memory: pass recent choices as `restingItems` and rank them with `weight`.",
        ],
        alternatives: [
          { when: "A value for a form field, chosen from a list", use: "combobox" },
          { when: "A few actions under one button", use: "menu" },
        ],
        keys: [
          { key: "Cmd+K / Ctrl+K", action: "Opens the palette, with `useCommandPaletteShortcut`." },
          { key: "/", action: "Opens the palette too, except while typing in a text field." },
          { key: "↓ / ↑", action: "Moves through the finds while the field keeps the focus." },
          { key: "Enter", action: "Chooses the marked find." },
          { key: "Escape", action: "Closes the palette." },
        ],
        limits: [
          "No memory of past choices and no ranking of its own beyond the match: recency and frequency are weights you keep.",
          "No nested steps or arguments: a command that needs input opens your own form after it is chosen.",
        ],
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
        sentence: "A single figure with its verdict: read against limits, with the history before it, the deviation from its target and how fresh it is (also called a KPI tile or metric card). Reach for it for the few numbers a screen is watched for.",
        about: [
          "The tile gets a rule, not a colour: `limits` are values with a side and a severity, and the colour and the verdict word follow from them. The same limit model drives the charts' limit lines (ADR-0006).",
          "Four verdicts, in order: in order, unknown, warning, alarm. A missing or non-finite value is unknown, never in order. A `target` is missed by an amount and shown as a signed deviation; it is never a limit.",
          "Freshness is a separate axis: with `asOf` and `ages` the tile says when its value is stale or lost and keeps its verdict, since the last value is the best one there is (ADR-0010). `useFreshness` gives the same reading for your own parts.",
        ],
        alternatives: [
          { when: "A share of a whole, drawn as a bar", use: "meter" },
          { when: "Only the shape of a history, in a row or a cell", use: "sparkline" },
          { when: "A value over time with axes and limit lines", use: "`Line` and `LimitLine` from @umriss-ui/charts" },
        ],
        limits: [
          "No trend arrow: a direction from two noisy points is read as information it does not carry; the history line shows the shape.",
          "It fetches and polls nothing: freshness is judged from the `asOf` you give it.",
        ],
        types: ["StatProps"],
        exports: ["Stat", "useFreshness"],
      },
      {
        id: "meter",
        name: "Meter",
        sentence: "A bar that shows a measured share, such as capacity booked or budget used, coloured by your verdict on it (also called a gauge bar or level indicator). Reach for it in lists and tables where a percentage alone is hard to compare.",
        about: [
          "`value` runs from 0 to 1 and is clamped outside; say the true figure beside the bar where it can pass 100 %.",
          "The `tone` is your assessment, since only you know whether 90 % is good or bad; the bar never colours itself by height. Keep the number or a word beside it so the colour is never alone.",
          "The role `meter` needs a name from you: `label` says what is measured, and neither the percentage nor a column heading counts as one.",
        ],
        alternatives: [
          { when: "How far a job has come towards its end", use: "progressbar" },
          { when: "One figure read against limits, with its history", use: "stat" },
        ],
        limits: [
          "No limit marks, target tick or scale on the bar; for a value against limits use a [Stat](#/stat).",
        ],
        types: ["MeterProps"],
        exports: ["Meter"],
      },
      {
        id: "sparkline",
        name: "Sparkline",
        sentence: "A small line of a history, at the height of a line of text, without axes or labels (also called a micro chart). Reach for it beside a value or in a table cell, where the shape of the last hours tells more than the figure alone.",
        about: [
          "It needs at least two values; with fewer it draws nothing. The line is ink, not meaning: the `accent` tone is for picking out one line among several, never for a verdict.",
        ],
        alternatives: [
          { when: "A figure with its verdict and a history beneath", use: "stat" },
          { when: "Axes, values, limits or several series", use: "`Line` from @umriss-ui/charts" },
        ],
        limits: [
          "No axes, labels, tooltip or points to hover: the value stands beside it.",
        ],
        types: ["SparklineProps"],
        exports: ["Sparkline"],
      },
      {
        id: "badge",
        name: "Badge",
        sentence: "A small word or number at the edge of something else: a status, a count (also called a label or chip). Reach for it to mark the state of a row, or how many items wait behind a button.",
        about: [
          "It is never the only place a state is said: the word inside carries the meaning, and the tone repeats it for the eye.",
        ],
        alternatives: [
          { when: "The user can remove it, or it stands for a chosen filter", use: "tag" },
          { when: "A figure read against limits", use: "stat" },
        ],
        limits: [
          "It cannot be clicked or removed; a label the user acts on is a [Tag](#/tag).",
          "It counts nothing itself: capping at “99+” is yours.",
        ],
        types: ["BadgeProps"],
        exports: ["Badge"],
      },
      {
        id: "tag",
        name: "Tag",
        sentence: "A short label on content that the user can remove where you allow it (also called a chip). Reach for it for active filters, chosen values and assignments.",
        about: [
          "`onRemove` turns the label into a control. In a `TagGroup` the whole group is one tab stop, and focus moves to the neighbour after a removal instead of falling to the top of the page.",
          "A `disabled` tag keeps its place and loses its remove button: disabled speaks about the button, not the label. Every tone keeps its contrast in both themes, and the word carries the meaning.",
        ],
        alternatives: [
          { when: "A status that cannot be acted on", use: "badge" },
          { when: "The user picks several values from a list", use: "multiselect" },
        ],
        keys: [
          { key: "Tab", action: "Enters the group on one tag and leaves it on the next Tab." },
          { key: "← / → or ↑ / ↓", action: "Moves to the previous or next tag in the group." },
          { key: "Home / End", action: "Moves to the first or last tag." },
          { key: "Delete or Backspace", action: "Removes the focused tag and moves focus to its neighbour." },
        ],
        limits: [
          "No field for typing new tags: a tag input is a [MultiSelect](#/multiselect).",
          "Tags are not toggles: a set of choices to switch on and off is a group of [Checkbox](#/checkbox) or a [ButtonGroup](#/buttongroup).",
        ],
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
