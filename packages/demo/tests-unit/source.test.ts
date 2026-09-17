/* What is visible of an example file - the two string functions that are the
   only permitted difference between the file and the display. */

import { describe, expect, it } from "vitest";
import { asPackage, displaySource, withoutTitle } from "../src/tooling/source";

describe("asPackage", () => {
  it("replaces the library path in an import", () => {
    expect(asPackage('import { Button } from "../../../src";\n', "@umriss-ui/core")).toBe(
      'import { Button } from "@umriss-ui/core";\n',
    );
  });

  it("keeps a subpath", () => {
    expect(asPackage('import "../../../src/styles/tokens.css";\n', "@umriss-ui/core")).toBe(
      'import "@umriss-ui/core/styles/tokens.css";\n',
    );
  });

  it("also hits the `from` of a wrapped import", () => {
    const source = 'import {\n  Button,\n  Card,\n} from "../../../src";\n';
    expect(asPackage(source, "@umriss-ui/core")).toBe('import {\n  Button,\n  Card,\n} from "@umriss-ui/core";\n');
  });

  it("leaves the same text alone in the example's body", () => {
    /* An example that talks about paths must not be shot through by this - the
       replacement hangs on the `from`, not on the path. */
    const source = 'const path = "../../../src";\nconsole.log("../../../src/x");\n';
    expect(asPackage(source, "@umriss-ui/core")).toBe(source);
  });

  it("leaves single quotes single", () => {
    expect(asPackage("import { Tag } from '../../../src';\n", "@umriss-ui/core")).toBe(
      "import { Tag } from '@umriss-ui/core';\n",
    );
  });
});

describe("asPackage for @umriss-ui/table", () => {
  it("inserts the name of the demo the example belongs to", () => {
    expect(asPackage('import { Toolbar, useTable } from "../../../src";\n', "@umriss-ui/table")).toBe(
      'import { Toolbar, useTable } from "@umriss-ui/table";\n',
    );
  });

  it("leaves an import from @umriss-ui/core as it is written", () => {
    /* An example of the table fetches Badge and UmrissProvider from
       @umriss-ui/core. That runs the same way at the reader's, so there is
       nothing to rewrite. */
    const source = 'import { Badge } from "@umriss-ui/core";\nimport { useTable } from "../../../src";\n';
    expect(asPackage(source, "@umriss-ui/table")).toBe(
      'import { Badge } from "@umriss-ui/core";\nimport { useTable } from "@umriss-ui/table";\n',
    );
  });
});

describe("withoutTitle", () => {
  it("takes the single-line export out", () => {
    const source = 'import { Button } from "../../../src";\n\nexport const title = "Variants";\n\nexport default function A() {\n  return <Button />;\n}\n';
    const shortened = withoutTitle(source);
    expect(shortened).not.toContain("title");
    expect(shortened).toBe(
      'import { Button } from "../../../src";\n\nexport default function A() {\n  return <Button />;\n}\n',
    );
  });

  it("takes an export running over two lines out entirely", () => {
    const source =
      'export const title =\n  "A very long title that was wrapped";\n\nexport default function A() {\n  return null;\n}\n';
    expect(withoutTitle(source)).toBe("export default function A() {\n  return null;\n}\n");
  });

  it("throws when there is none", () => {
    expect(() => withoutTitle("export default function A() {\n  return null;\n}\n")).toThrow(
      /title/,
    );
  });

  it("leaves a mention of `title` in the body standing", () => {
    const source = 'export const title = "X";\n\nconst titleLine = "y";\n';
    expect(withoutTitle(source)).toBe('const titleLine = "y";\n');
  });
});

describe("displaySource", () => {
  it("does both and nothing else", () => {
    const source =
      'import { Button } from "../../../src";\n\nexport const title = "Variants";\n\n/* A comment stays. */\nexport default function A() {\n  return <Button   variant="primary" />;\n}\n';
    const shown = displaySource(source, "@umriss-ui/core");
    expect(shown).not.toContain("../../../src");
    expect(shown).not.toContain("export const title");
    /* No reformatting: the three spaces stay where they are. */
    expect(shown).toContain('<Button   variant="primary" />');
    expect(shown).toContain("/* A comment stays. */");
  });
});
