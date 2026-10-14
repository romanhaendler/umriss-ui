/* The outline of the demo of @umriss-ui/dashboard - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. What is NOT here: the
   examples. They come from the files under `demo/examples/` and from nothing
   else - the folder is named like the page. */

import { addresses, apiIndexRubric } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What a dashboard is for, and what an application sets up before the first one.",
    pages: [
      {
        id: "dashboard",
        name: "Dashboard",
        sentence: "Shows widgets a developer declares, in the order a view stores them, each at its size, packed on twelve columns: the start screen of a data-dense application, with the figures one role looks at first.",
        about: [
          "The command brings the core package along, a peer dependency. React 19 or newer is a peer as well and stays the application's own. The stylesheet loads itself: the package imports it and marks CSS as a side effect.",
          "`useDashboard` takes the arrangement the application gives a reader and, optionally, the one the reader kept (`initialView`, read once). It hands back `Dashboard`, `WidgetType`, the view and `setView`.",
          "A widget type is declared as JSX: its name, a sentence, the sizes it offers with the columns and rows each takes, the size to start from, its default options and its content as a function of the size and the options. The options type is inferred from the default options.",
          "The widgets are packed in the stored order, each at the first place at or after the one before it where it fits; room left behind stays free. The columns never change in number, under a maximum width. Below the width at which a column would be too narrow to read, the dashboard is a list in the same order. The height follows the size and never the content.",
        ],
        alternatives: [{ when: "A layout the developer fixes, which the reader does not arrange", use: "`Grid`, `Stack` and `Splitter` from @umriss-ui/core" }],
        keys: [
          { key: "Tab", action: "In the editing mode, moves to the next widget's head and its menu button." },
          { key: "Arrow keys", action: "On a focused head, move the widget one place earlier or later." },
          { key: "Home or End", action: "On a focused head, move the widget to the start or the end." },
        ],
        accessibility: [
          "The dashboard is a group named by its `aria-label`; every widget is a region named by its title. In the editing mode a widget's head is a tab stop named \"<title>, place n of m\", and its menu button \"Actions for <title>\".",
          "Every move, size, removal, addition, undo, redo, reset, \"Done\" and \"Cancel\" is announced through core's live region: \"Orders: moved from place 1 to place 3 of 5\". The words are core's wording, German under `@umriss-ui/core/wording/de`.",
        ],
        limits: ["A widget's height follows its size, never its content: what does not fit is cut, not grown."],
        types: ["DashboardOptions", "DashboardParts", "DashboardProps", "DashboardView", "DashboardWidget", "WidgetSize", "SizeSpan", "WidgetTypeProps", "WidgetContent", "WidgetFormProps", "HeadingOptions"],
        exports: ["useDashboard", "WidgetType", "HeadingType"],
        installs: true,
      },
    ],
  },
  apiIndexRubric("@umriss-ui/dashboard"),
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromPlace } = ADDRESSES;
