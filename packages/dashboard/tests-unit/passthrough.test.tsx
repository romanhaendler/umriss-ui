/* The pass-through guard of the dashboard: an element - ref, class, style and
   the rest reach the root group. `Dashboard` is read from a harness, since the
   hook hands it back. */

import { renderHook } from "@testing-library/react";
import * as dashboard from "../src";
import { useDashboard } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase, Probe } from "../../demo/tests-support/passThroughGuard.tsx";

const { result, unmount } = renderHook(() => useDashboard({ defaultView: { widgets: [] } }));
const { Dashboard } = result.current;
unmount();

const CASES: Record<string, PassThroughCase> = {
  Dashboard: {
    render: (probe: Probe) => <Dashboard {...(probe as object)} />,
    root: (element) => element.getAttribute("role") === "group",
  },
};

passThroughGuard("dashboard", { ...dashboard, Dashboard }, CASES, {
  WidgetType: "declares a widget type for the dashboard, which draws it; no element of its own",
  HeadingType: "declares the heading type; it draws no element",
});
