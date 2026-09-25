import { Card, Splitter, Text } from "../../../src";

export const title = "Two panes";
export const lead = "Give the splitter a box with a height and two children; `defaultValue` is the first pane's starting share in per cent.";

export default function TwoPanes() {
  return (
    <Card style={{ height: 200 }}>
      <Splitter defaultValue={35} style={{ height: "100%" }}>
        <div style={{ padding: 16 }}>
          <Text size="sm">Today's tours</Text>
        </div>
        <div style={{ padding: 16 }}>
          <Text size="sm">The chosen tour's stops</Text>
        </div>
      </Splitter>
    </Card>
  );
}
