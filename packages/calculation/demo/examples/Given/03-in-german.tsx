import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Calculation, Chain, Given, Interim, Minus, Product, Ref } from "../../../src";

export const title = "Read in German";
export const lead = "Operator words, reasons and number formats come from core's `LanguageProvider` (ADR-0019); your labels stay as you write them.";

export default function InGerman() {
  return (
    <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
      <Calculation aria-label="Rechnung INV-26-0317, Messestand">
        <Chain>
          <Given id="stand" label="Messestand, 3 Tage" value={12400} unit="€" decimals={2} />
          <Minus>
            <Product label="Rabatt" unit="€" decimals={2}>
              <Given label="Rabattsatz" value={0.05} format="percent" />
              <Ref to="stand" />
            </Product>
          </Minus>
          <Interim label="Nettobetrag" unit="€" decimals={2} />
        </Chain>
      </Calculation>
    </LanguageProvider>
  );
}
