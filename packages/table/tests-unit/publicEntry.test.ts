/* The parts of the plant layer need nothing private (umriss-table 12 and 13).
   Checked on the source: every file may import only what a caller of
   @umriss-ui/table could import too - React, @umriss-ui/core, the public entry of
   the package - and its own neighbours. */

import { describe, expect, it } from "vitest";
import alarmList from "../src/alarms/AlarmList.tsx?raw";

const importsOf = (source: string) => [...source.matchAll(/from "([^"]+)"/g)].map(([, target]) => target);

describe("AlarmList", () => {
  it("imports only the public entry of the package", () => {
    for (const target of importsOf(alarmList)) {
      expect(["react", "@umriss-ui/core", "../index", "./alarmModel", "./AlarmList.module.css"]).toContain(target);
    }
  });
});
