import { Card, CardBody, CardHeader } from "../../../src";

export const title = "A flush body";
export const lead = "Where the body runs edge to edge, like a log or a table, set `flush` on the body and `divider` on the head.";

const LOG = `09:42:10  OPENED        INC-1048 by the latency alert on Checkout
09:46:02  ACKNOWLEDGED  Jonas Keller
09:58:37  NOTE          Card payments time out at the provider; retries doubled the load
10:11:05  MITIGATED     Retries capped at one, p95 back below 300 ms`;

export default function AFlushBody() {
  return (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader divider eyebrow="INC-1048" title="Timeline" />
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
        >
          {LOG}
        </pre>
      </CardBody>
    </Card>
  );
}
