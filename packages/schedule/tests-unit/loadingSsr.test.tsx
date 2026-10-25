// @vitest-environment node
/* A loading schedule is busy in the server's markup too. */

import { expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { useSchedule } from "../src";

function Plan({ loading }: { loading: boolean }) {
  const { Schedule } = useSchedule();
  return <Schedule aria-label="Plan" loading={loading} />;
}

it("renders the plot busy while loading, and not otherwise", () => {
  expect(renderToString(<Plan loading />)).toContain('aria-busy="true"');
  expect(renderToString(<Plan loading={false} />)).not.toContain("aria-busy");
});
