import { Button, Stack } from "@umriss-ui/core";
import { Calculation, Given, Product, Sum } from "../../../src";

export const title = "Print the working";
export const lead = "Nothing to set: paper cannot unfold a level, so every derivation prints open under its figure and the disclosure buttons stay off the sheet.";

export default function PrintTheWorking() {
  return (
    <Stack gap={3}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <Calculation aria-label="Daily balance, hall 2">
        <Sum label="Cost of the day" unit="€" decimals={2}>
          <Product label="Labour">
            <Given label="Hours" value={96} unit="h" />
            <Given label="Rate" value={38.5} unit="€/h" decimals={2} />
          </Product>
          <Product label="Material">
            <Given label="Pallets" value={412} unit="pcs" />
            <Given label="Price per pallet" value={6.2} unit="€/pc" decimals={2} />
          </Product>
        </Sum>
      </Calculation>
    </Stack>
  );
}
