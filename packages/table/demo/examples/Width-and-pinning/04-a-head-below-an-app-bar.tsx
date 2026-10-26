import { Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "A head below an app bar";
export const lead = "Make the main area below the bar the table's frame, a parent of definite height, or give the table `maxHeight=\"calc(100dvh - 64px)\"`. No offset can help: the head sticks in the table's own scroll area, which carries the horizontal scroll, the pinned blocks and the virtual window.";

/* The bar is the pane's first row; the main area takes the rest, and the
   table fills it. The table's own scroll area is then the pane's, so the
   head sticks to the top of the main area and not to the page. */
const STYLE = `
.app-pane {
  display: flex;
  flex-direction: column;
  height: 320px;
}
.app-bar {
  flex: none;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  background: var(--u-color-surface);
}
.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.app-table {
  flex: 1;
  min-height: 0;
  max-height: 100%;
}
`;

const DEPLOYS = [
  ["Checkout", "2.14.0", "Healthy"],
  ["Billing", "1.9.3", "Healthy"],
  ["Webhooks", "3.0.1", "Degraded"],
  ["Search", "5.2.0", "Healthy"],
  ["Catalogue", "4.7.2", "Healthy"],
  ["Accounts", "2.0.8", "Down"],
  ["Notifications", "1.4.0", "Healthy"],
  ["Reports", "0.9.6", "Degraded"],
  ["Exports", "1.1.2", "Healthy"],
  ["Uploads", "2.6.5", "Healthy"],
  ["Pricing", "3.3.0", "Healthy"],
  ["Shipping", "1.8.1", "Healthy"],
].map(([service, version, state], i) => ({
  id: `d${i + 1}`,
  service: service!,
  version: version!,
  state: state!,
  instances: 2 + (i % 4),
}));

export default function AppBarHead() {
  const { Table, Column } = useTable(DEPLOYS, { rowKey: (d) => d.id });

  return (
    <>
      <style>{STYLE}</style>
      <div className="app-pane">
        <div className="app-bar">
          <Text as="span" weight="semibold">
            Deployments
          </Text>
        </div>
        <div className="app-main">
          <Table className="app-table" stickyHeader maxHeight="100%" aria-label="Deployments per service">
            <Column value="service" label="Service" rowHeader width={160} />
            <Column value="version" label="Version" width={96} />
            <Column value="state" label="State" width={120} />
            <Column value="instances" label="Instances" width={96} />
          </Table>
        </div>
      </div>
    </>
  );
}
