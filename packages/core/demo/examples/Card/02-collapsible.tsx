import { Badge, Card, CardBody, CardHeader } from "../../../src";

export const title = "Collapsible, with foreign content";

/* `collapsible` turns the head into the button for the body;
   `defaultCollapsed` is the starting state, after which it belongs to the
   card.

   The content here is a `<pre>` with a log - the card knows nothing of that
   and need know nothing of it. That is exactly the job of a surface. */
export default function Collapsible() {
  return (
    <Card collapsible defaultCollapsed>
      <CardHeader divider eyebrow="Structure" title="Activity log" actions={<Badge pill>3 entries</Badge>} />
      <CardBody flush>
        <pre
          style={{
            margin: 0,
            padding: "var(--u-space-4)",
            overflowX: "auto",
            fontFamily: "var(--u-font-mono)",
            fontSize: "var(--u-text-xs)",
            lineHeight: 1.7,
            color: "var(--u-color-text-secondary)",
          }}
        >{`10:02:14  SIGN-IN   m.weber            Session started (SSO)
10:04:31  CHANGE    Project "Cirrus"   Budget updated: 198,000 EUR to 212,000 EUR
10:05:02  EXPORT    j.fontaine         Project list exported as CSV (5 rows)`}</pre>
      </CardBody>
    </Card>
  );
}
