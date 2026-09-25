import { Card, CardBody, CardHeader, EmptyState } from "../../../src";

export const title = "Mark good news in a panel";
export const lead = "An empty panel can be the good case; an `icon` and a plain `title` say so, and no action is needed.";

function Check() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InAPanel() {
  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader eyebrow="Identity" title="Open incidents" />
      <CardBody>
        <EmptyState
          icon={<Check />}
          title="No open incidents"
          description="The last one, INC-1045, was resolved yesterday at 15:05."
        />
      </CardBody>
    </Card>
  );
}
