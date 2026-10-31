import { Avatar, Stack } from "../../../src";

export const title = "A picture, and its fallback";
export const lead = "A picture that fails to load gives way to the initials; `initials` overrides the derived ones, for a team.";

/* A one-pixel image, inline so the example runs on its own. */
const PICTURE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Crect width='4' height='4' fill='%230b6a61'/%3E%3Ccircle cx='2' cy='1.5' r='.8' fill='%23fff'/%3E%3Crect x='.7' y='2.6' width='2.6' height='2' rx='1' fill='%23fff'/%3E%3C/svg%3E";

export default function PictureAndFallback() {
  return (
    <Stack direction="row" gap={3} align="center">
      <Avatar name="Noah Weber" src={PICTURE} />
      <Avatar name="Eva Lindqvist" src="/no-such-picture.png" />
      <Avatar name="Platform team" initials="PT" />
    </Stack>
  );
}
