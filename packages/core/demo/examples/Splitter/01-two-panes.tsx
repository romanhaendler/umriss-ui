import { Card, Splitter, Text } from "../../../src";

export const title = "Two panes, side by side";

/* The first step: two panes and the line between them, the share kept by the
   splitter. Drag the line, or Tab to it and use the arrows - five per cent a
   press; Home and End go to the bounds, Enter folds the left pane away and
   brings it back. The box's height is the caller's: a splitter divides a
   room, it does not size it. */
export default function TwoPanes() {
  return (
    <Card style={{ height: 200 }}>
      <Splitter defaultValue={35} style={{ height: "100%" }}>
        <div style={{ padding: 16 }}>
          <Text size="sm">Stations</Text>
        </div>
        <div style={{ padding: 16 }}>
          <Text size="sm">The chosen station's details</Text>
        </div>
      </Splitter>
    </Card>
  );
}
