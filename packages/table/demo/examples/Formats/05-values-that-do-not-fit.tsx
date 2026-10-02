import { Badge } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Fit what does not fit";
export const lead = "Nothing in a cell wraps and no row grows. Text ends in an ellipsis, and a tip shows it whole; a component that does not fit is cut at the column's edge - give its column room, or show the whole in the row's detail.";

interface Service {
  name: string;
  tags: readonly string[];
  note: string;
}

const SERVICES: Service[] = [
  { name: "Checkout", tags: ["payments", "eu-west", "critical", "pci"], note: "Card payments time out above 300 ms; the provider's status page says a partial outage." },
  { name: "Billing", tags: ["payments", "eu-west"], note: "Invoices go out on the first working day." },
  { name: "Webhooks", tags: ["integrations", "us-east", "beta"], note: "Retries back off up to an hour; a receiver that answers 410 is dropped." },
];

export default function ValuesThatDoNotFit() {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.name });

  return (
    <Table ariaLabel="Services with tags and notes">
      <Column value="name" label="Service" rowHeader width={120} />
      <Column value="tags" label="Tags" width={170} sortable={false}>
        {(tags) =>
          tags.map((tag) => (
            <Badge key={tag} style={{ marginRight: 4 }}>
              {tag}
            </Badge>
          ))
        }
      </Column>
      <Column value="note" label="Note" width={300} sortable={false} />
    </Table>
  );
}
