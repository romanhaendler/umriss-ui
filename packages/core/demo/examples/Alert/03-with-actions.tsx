import { Alert, Button } from "../../../src";

export const title = "Offer the way forward";
export const lead = "Put the next step in `actions`, under the text it belongs to, rather than somewhere else on the page.";

export default function WithActions() {
  return (
    <Alert
      tone="warning"
      title="Invoice INV-26-0318 is waiting for your approval"
      actions={
        <>
          <Button size="sm" variant="primary">
            Review the invoice
          </Button>
          <Button size="sm" variant="ghost">
            Pass it on
          </Button>
        </>
      }
    >
      It is due on 15 April and books € 1,965.84 to Facilities (CC-4400).
    </Alert>
  );
}
