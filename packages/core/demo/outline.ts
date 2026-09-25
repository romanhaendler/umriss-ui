/* The outline of the demo - in one place.

   It is data, not markup: the sidebar, the overview, the jump palette, the
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

   On the cut. Eight rubrics, each of which is one subject. Three names still
   carry an "and" - `Layout and text`, `Status and waiting` and `Navigation and
   structure` - and in each the "and" joins two halves of one subject instead
   of hiding a seam, which is the difference from the `Foundation` and
   `Structure and overlays` this cut retired. All three are argued name by name
   in `.scratch/demo-rubrics/issues/01`. Within a rubric the pages run from the
   simple to the composed and not alphabetically: an alphabet is an index, and
   the palette is already one (CONTEXT.md, "Rubric").

   The order follows the page, not taste: a sidebar sorted differently from
   what it jumps to confuses precisely when one trusts it. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "setup",
    name: "Setup",
    sentence: "The one component an application meets before every other - and the only page here that is not a component.",
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
    name: "Layout and text",
    sentence: "The surface a page stands on, and the type it is set in.",
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
    sentence: "Everything that takes a value - with its notation and its states.",
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
    id: "status",
    name: "Status and waiting",
    sentence: "What a surface says about itself: a message, a mark - and the three shapes of something not yet there.",
    pages: [
      {
        id: "alert",
        name: "Alert",
        sentence: "A standing message in the flow of the page: tone, title, text and at most one action.",
        types: ["AlertProps"],
        exports: ["Alert"],
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
    sentence: "What opens above the surface and gives it back when it is answered.",
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
    name: "Navigation and structure",
    sentence: "How one gets from one place to the next - and how many places are held in one.",
    pages: [
      {
        id: "breadcrumb",
        name: "Breadcrumb",
        sentence: "Where a page stands, from the plant down - and the way back up, folded into a menu where the place runs short.",
        types: ["BreadcrumbProps", "BreadcrumbEntry"],
        exports: ["Breadcrumb"],
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
    id: "monitoring",
    name: "Monitoring",
    sentence: "A value read against its limits - and its shape over time.",
    pages: [
      {
        id: "stat",
        name: "Stat",
        sentence: "A figure with an assessment, a history, a deviation from target, and a freshness independent of all of it.",
        types: ["StatProps"],
        exports: ["Stat", "useFreshness"],
      },
      {
        id: "sparkline",
        name: "Sparkline",
        sentence: "A history at line height, without axes and without labels - the shape, not the value.",
        types: ["SparklineProps"],
        exports: ["Sparkline"],
      },
      {
        id: "meter",
        name: "Meter",
        sentence: "A bar for a fraction that draws its colour from an assessment and not from taste.",
        types: ["MeterProps"],
        exports: ["Meter"],
      },
    ],
  },
];

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
