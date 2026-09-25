import { useState } from "react";
import { Card, CardBody, CardHeader, FormField, Grid, NumberInput, Stack, Text, useFormats } from "../../../src";

export const title = "Price an invoice line";
export const lead = "Several number fields feed one derived figure; the total is computed from the values and never stored beside them.";

export default function PriceAnInvoiceLine() {
  const formats = useFormats();
  const [quantity, setQuantity] = useState<number | null>(40);
  const [unitPrice, setUnitPrice] = useState<number | null>(12.9);
  const [discount, setDiscount] = useState<number | null>(5);

  const net = (quantity ?? 0) * (unitPrice ?? 0) * (1 - (discount ?? 0) / 100);

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader eyebrow="INV-2031, line 2" title="Printer paper, A4, 500 sheets" />
      <CardBody>
        <Stack gap={4}>
          <Grid minItemWidth="140px" gap={3}>
            <FormField label="Quantity">
              <NumberInput value={quantity} onChange={setQuantity} min={0} decimals={0} />
            </FormField>
            <FormField label="Unit price">
              <NumberInput value={unitPrice} onChange={setUnitPrice} min={0} decimals={2} step={0.1} suffix="€" />
            </FormField>
            <FormField label="Discount">
              <NumberInput value={discount} onChange={setDiscount} min={0} max={100} decimals={1} suffix="%" />
            </FormField>
          </Grid>
          <Text size="sm">
            Line total, net: <Text as="span" mono>{formats.number(net, 2)} €</Text>
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}
