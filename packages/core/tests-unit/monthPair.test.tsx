/* The month pair (range-panel-parts). The assurance that was previously only
   asserted: the two months do not drift apart - the right one is always the
   month following the left one, and both are furnished alike. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthPair } from "../src/components/DatePicker/RangePanel";

const noop = () => {};
const build = (view: Date) =>
  render(
    <MonthPair
      view={view}
      onView={noop}
      active={new Date(2026, 5, 15)}
      onActive={noop}
      onPick={noop}
      bandFrom={null}
      bandTo={null}
      previewTo={null}
      onHoverDay={noop}
    />,
  );

describe("MonthPair", () => {
  it("shows the left month and the month following it", () => {
    build(new Date(2026, 5, 1));
    expect(screen.getByText("Juni 2026")).toBeTruthy();
    expect(screen.getByText("Juli 2026")).toBeTruthy();
  });

  it("gets across the turn of the year", () => {
    build(new Date(2026, 11, 1));
    expect(screen.getByText("Dezember 2026")).toBeTruthy();
    expect(screen.getByText("Januar 2027")).toBeTruthy();
  });

  /* Only the left month carries the back arrow, only the right one the forward
     arrow: otherwise the two could drift apart. */
  it("gives each month exactly one navigation arrow", () => {
    build(new Date(2026, 5, 1));
    expect(screen.getAllByLabelText("Previous month")).toHaveLength(1);
    expect(screen.getAllByLabelText("Next month")).toHaveLength(1);
  });
});
