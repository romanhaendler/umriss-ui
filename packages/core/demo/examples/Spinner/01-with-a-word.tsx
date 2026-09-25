import { Spinner, Stack, Text } from "../../../src";

export const title = "With a word beside it";
export const lead = "A spinner says only that something runs; the words beside it say what.";

export default function WithAWord() {
  return (
    <Stack direction="row" gap={2} align="center">
      <Spinner aria-label="Loading the tours" />
      <Text size="sm" tone="secondary">
        Loading the tours of North depot …
      </Text>
    </Stack>
  );
}
