/* 100 % width in a draggable container, a fixed size beside it, and a chart in a
   collapsible surrounding.

   The three cases a chart meets in an application, and the one thing they have
   in common: the chart measures its host rather than being told a pixel. A
   container that collapses to nothing and comes back has to redraw at the width
   it finds, not at the one it had. */

import { useState } from "react";
import { Chart, Line, XAxis, YAxis } from "../../../src";
import { basicData, type Point } from "@umriss-ui/demo/worlds/plant";

export const title = "Size and resize";

export default function Sizes() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="resizable">
        <Chart data={basicData} height={200} ariaLabel="Full width, draggable">
          <XAxis accessor={(d: Point) => d.t} />
          <YAxis accessor={(d: Point) => d.a} />
          <Line accessor={(d: Point) => d.a} name="Series A" />
        </Chart>
      </div>
      <button className="demo-button" onClick={() => setCollapsed((v) => !v)}>{collapsed ? "Expand" : "Collapse"}</button>
      {!collapsed && (
        <div className="side-by-side">
          <Chart data={basicData} width={420} height={180} ariaLabel="Fixed size">
            <XAxis accessor={(d: Point) => d.t} />
            <YAxis accessor={(d: Point) => d.a} />
            <Line accessor={(d: Point) => d.a} name="Series A" />
          </Chart>
          <div className="narrow">
            <Chart data={basicData} height={180} ariaLabel="Narrow container">
              <XAxis accessor={(d: Point) => d.t} />
              <YAxis accessor={(d: Point) => d.a} />
              <Line accessor={(d: Point) => d.a} name="Series A" />
            </Chart>
          </div>
        </div>
      )}
    </>
  );
}
