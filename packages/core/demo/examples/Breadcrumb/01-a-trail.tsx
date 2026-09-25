import { Breadcrumb } from "../../../src";

export const title = "A trail";
export const lead = "Pass the `items` from the top down; the last is the current page, marked as such and not a link.";

export default function ATrail() {
  return (
    <Breadcrumb
      items={[
        { label: "Finance", href: "#/breadcrumb" },
        { label: "Cost centres", href: "#/breadcrumb" },
        { label: "Marketing, CC-1200" },
      ]}
    />
  );
}
