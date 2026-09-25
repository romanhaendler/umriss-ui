import { Badge, Text } from "../../../src";

export const title = "A badge";
export const lead = "A short word at the edge of what it describes; it repeats a state the text around it could also carry.";

export default function ABadge() {
  return (
    <Text size="sm">
      Profile page <Badge>In progress</Badge>
    </Text>
  );
}
