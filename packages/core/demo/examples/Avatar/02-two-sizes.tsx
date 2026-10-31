import { Avatar, Stack } from "../../../src";

export const title = "Two sizes";
export const lead = "`md` heads a lane; `sm` sits in a table cell beside the name.";

export default function TwoSizes() {
  return (
    <Stack direction="row" gap={3} align="center">
      <Avatar name="Chloe Martin" />
      <Avatar name="Chloe Martin" size="sm" />
    </Stack>
  );
}
