import { expect, it } from "vitest";
import { zoneDayStart } from "../src/lib/zone";

it("begins the zone's day, 25 hours long on Berlin's clock change", () => {
  const at = Date.UTC(2026, 9, 25, 10);
  expect(zoneDayStart(at, "Europe/Berlin").toISOString()).toBe("2026-10-24T22:00:00.000Z");
  expect(zoneDayStart(at, "America/New_York").toISOString()).toBe("2026-10-25T04:00:00.000Z");
  expect(zoneDayStart(new Date(at), undefined).getTime()).toBe(zoneDayStart(at, "Europe/Berlin").getTime());
});
