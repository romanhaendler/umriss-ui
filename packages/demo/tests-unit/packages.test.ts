/* The one list of packages (`src/packages.ts`). The pages build reads it in
   plain Node, so that is how it is loaded here - through vitest it would pass
   even with an import Node cannot resolve. */

import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it("loads in Node without a bundler, the five in their fixed order", () => {
  /* A file URL, not a path: Node's import() reads `C:\...` as a URL scheme. */
  const file = new URL("../src/packages.ts", import.meta.url).href;
  const ids = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `const { PACKAGES } = await import(${JSON.stringify(file)}); console.log(PACKAGES.map((p) => p.id).join())`,
    ],
    { encoding: "utf8" },
  );
  expect(ids.trim()).toBe("core,charts,table,schedule,calculation,dashboard,alarms");
});

