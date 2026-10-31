import { Avatar, Stack, Text } from "../../../src";

export const title = "Beside a name";
export const lead = "In a list the mark leads the name, so the eye finds a person by the mark first.";

const PEOPLE = ["Arjun Rao", "Chloe Martin", "Noah Weber", "Eva Lindqvist", "Hana Sato"];

export default function BesideAName() {
  return (
    <Stack gap={2}>
      {PEOPLE.map((name) => (
        <Stack key={name} direction="row" gap={2} align="center">
          <Avatar name={name} size="sm" />
          <Text as="span" size="sm">
            {name}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
