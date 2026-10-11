// @vitest-environment node
/* A calculation rendered on a server (platform-claims-proved 02): the list, its
   rows and their amounts, the folded rows `hidden`. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation } from "../src";
import { costing } from "./costing";
import { OeeCalculation } from "./oee";

describe("a calculation on a server", () => {
  it("renders the list, every row's label and amount", () => {
    const html = renderToString(<Calculation aria-label="Costing">{costing()}</Calculation>);
    expect(html).toContain("Costing");
    for (const text of ["Direct material", "Material cost", "Cost price", "Net offer price", "1,840"]) expect(html).toContain(text);
  });

  it("renders the amounts in the language in use", () => {
    const html = renderToString(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Calculation aria-label="Costing">{costing()}</Calculation>
      </LanguageProvider>,
    );
    expect(html).toContain("1.840");
  });

  it("renders the folded rows hidden", () => {
    const html = renderToString(<OeeCalculation />);
    expect(html).toMatch(/<ul[^>]* hidden/);
  });

  it("renders the same markup twice", () => {
    expect(renderToString(<OeeCalculation />)).toBe(renderToString(<OeeCalculation />));
    expect(renderToString(<Calculation aria-label="Costing">{costing()}</Calculation>)).toBe(renderToString(<Calculation aria-label="Costing">{costing()}</Calculation>));
  });
});
