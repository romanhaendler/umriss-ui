/* The list needs nothing private. Checked on the source: it may import only what
   a caller could import too - React, the public entries of @umriss-ui/core and
   @umriss-ui/table - and its own neighbours. */

import { describe, expect, it } from "vitest";
import alarmList from "../src/AlarmList.tsx?raw";

const importsOf = (source: string) => [...source.matchAll(/from "([^"]+)"/g)].map(([, target]) => target);

describe("AlarmList", () => {
  it("imports only the public entries of core and table", () => {
    for (const target of importsOf(alarmList)) {
      expect(["react", "@umriss-ui/core", "@umriss-ui/table", "./alarmModel", "./AlarmList.module.css"]).toContain(target);
    }
  });
});
