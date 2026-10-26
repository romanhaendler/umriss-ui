import { useDashboard } from "../../../src";

export const title = "A dashboard without widgets";
export const lead = "A dashboard that has no widgets says so, in the language of the surrounding provider.";

export default function Empty() {
  const { Dashboard } = useDashboard({ defaultView: { widgets: [] } });
  return <Dashboard headingLevel={4} aria-label="Nothing yet" />;
}
