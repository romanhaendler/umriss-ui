import { useState } from "react";
import { Button, ButtonGroup, MenuItem, MenuSeparator, SplitButton, Stack, Text } from "../../../src";
import { INVOICES } from "@umriss-ui/demo/worlds/controlling";

export const title = "Build an invoice toolbar";
export const lead = "A group to page through the queue and a split button for the decision, as an approver's toolbar puts them.";

const QUEUE = INVOICES.filter((invoice) => invoice.status === "awaiting approval");

export default function InvoiceToolbar() {
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const invoice = QUEUE[index]!;
  const decide = (what: string) => setNote(`${invoice.id}: ${what}`);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} align="center" justify="space-between" wrap>
        <Stack direction="row" gap={3} align="center">
          <ButtonGroup aria-label="Invoices awaiting approval">
            <Button size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Previous
            </Button>
            <Button size="sm" disabled={index === QUEUE.length - 1} onClick={() => setIndex(index + 1)}>
              Next
            </Button>
          </ButtonGroup>
          <Text size="sm">
            <Text as="span" size="sm" mono>
              {invoice.id}
            </Text>{" "}
            · {invoice.supplier} · {index + 1} of {QUEUE.length}
          </Text>
        </Stack>
        <SplitButton
          size="sm"
          variant="primary"
          onClick={() => decide("approved")}
          menu={
            <>
              <MenuItem onSelect={() => decide("approved with a comment")}>Approve with a comment</MenuItem>
              <MenuItem onSelect={() => decide("sent back to the requester")}>Send back</MenuItem>
              <MenuSeparator />
              <MenuItem tone="danger" onSelect={() => decide("rejected")}>
                Reject
              </MenuItem>
            </>
          }
        >
          Approve
        </SplitButton>
      </Stack>
      <Text size="xs" tone="muted">
        {note === "" ? "No decision yet" : note}
      </Text>
    </Stack>
  );
}
