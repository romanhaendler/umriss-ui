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
