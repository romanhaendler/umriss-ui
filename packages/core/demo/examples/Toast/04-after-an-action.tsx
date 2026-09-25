import { useState } from "react";
import { Badge, Button, Stack, Text, useToast } from "../../../src";

export const title = "Confirm an action in a list";
export const lead = "The row changes where the reader looks; the toast confirms it in passing, so a second approval never waits on the first.";

const INVOICES = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", amount: "€ 1,965.84" },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", amount: "€ 12,733.00" },
  { id: "INV-26-0316", supplier: "Northgate Cloud Services", amount: "€ 4,284.00" },
];

export default function AfterAnAction() {
  const { toast } = useToast();
  const [approved, setApproved] = useState<string[]>([]);

  return (
    <Stack gap={2} style={{ maxWidth: 560 }}>
      {INVOICES.map((invoice) => {
        const done = approved.includes(invoice.id);
        return (
          <Stack key={invoice.id} direction="row" gap={3} align="center" justify="space-between">
            <Stack gap={1}>
              <Text size="sm" weight="medium">
                {invoice.supplier}
              </Text>
              <Text size="xs" tone="muted" mono>
                {invoice.id} · {invoice.amount}
              </Text>
            </Stack>
            {done ? (
              <Badge tone="success">Approved</Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setApproved((list) => [...list, invoice.id]);
                  toast({ title: `${invoice.id} approved`, description: "It goes to Finance for payment.", tone: "success" });
                }}
              >
                Approve
              </Button>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
