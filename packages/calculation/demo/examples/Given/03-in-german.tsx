import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Chain, Given, Interim, Plus, Product, Ref } from "../../../src";

export const title = "In German";

/* The operator words, the reasons for absence, the approximation note and the
   disclosure labels are core's wording, English by default and German behind
   the subpath (ADR-0019). The numbers follow the formats: 1.840,00 €. The
   labels are yours and stay as you write them. */
export default function InGerman() {
  return (
    <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
      <Calculation aria-label="Materialkosten, Auftrag A-2041">
        <Chain>
          <Given id="mek" label="Materialeinzelkosten" value={1840} unit="€" decimals={2} />
          <Plus>
            <Product label="Materialgemeinkosten" unit="€" decimals={2}>
              <Given label="Zuschlagssatz" value={0.12} format="percent" />
              <Ref to="mek" />
            </Product>
          </Plus>
          <Interim label="Materialkosten" unit="€" decimals={2} />
        </Chain>
      </Calculation>
    </LanguageProvider>
  );
}
