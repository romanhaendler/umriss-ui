/* The five worlds: the same data on every import and every call - a
   screenshot holds still only if they do - and a cast that holds together. */

import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as operations from "../src/worlds/operations";
import * as logistics from "../src/worlds/logistics";
import * as controlling from "../src/worlds/controlling";
import * as planning from "../src/worlds/planning";
import * as plant from "../src/worlds/plant";

const WORLDS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "worlds");
const NAMES = ["operations", "logistics", "controlling", "planning", "plant"];

const unique = (ids: readonly string[]) => new Set(ids).size === ids.length;

describe("the worlds", () => {
  it("are the five, and import nothing", () => {
    expect(readdirSync(WORLDS_DIR).sort()).toEqual(NAMES.map((name) => `${name}.ts`).sort());
    for (const name of NAMES) {
      expect(readFileSync(join(WORLDS_DIR, `${name}.ts`), "utf8")).not.toMatch(/^\s*import\b/m);
    }
  });

  it("give the same data on a second import", async () => {
    for (const name of NAMES) {
      const first = { ...(await import(`../src/worlds/${name}.ts`)) };
      vi.resetModules();
      const second = { ...(await import(`../src/worlds/${name}.ts`)) };
      expect(JSON.stringify(second), name).toBe(JSON.stringify(first));
    }
  });

  it("give the same data on a second call", () => {
    expect(operations.metrics("checkout")).toEqual(operations.metrics("checkout"));
    expect(logistics.vehicleDay("v1")).toEqual(logistics.vehicleDay("v1"));
    expect(plant.plant(7)).toEqual(plant.plant(7));
    expect(operations.week("search", 600_000)).toEqual(operations.week("search", 600_000));
    expect(logistics.batteryDay("v2")).toEqual(logistics.batteryDay("v2"));
  });
});

describe("operations", () => {
  it("has services, engineers and incidents with unique ids that point at each other", () => {
    expect(operations.SERVICES.length).toBeGreaterThan(0);
    expect(unique(operations.SERVICES.map((one) => one.id))).toBe(true);
    expect(unique(operations.INCIDENTS.map((one) => one.id))).toBe(true);
    expect(unique(operations.ALERTS.map((one) => one.id))).toBe(true);
    const services = new Set(operations.SERVICES.map((one) => one.id));
    const engineers = new Set(operations.ENGINEERS.map((one) => one.id));
    for (const one of operations.INCIDENTS) {
      expect(services.has(one.service)).toBe(true);
      expect(engineers.has(one.assignee)).toBe(true);
    }
    for (const one of operations.ONCALL) expect(engineers.has(one.engineer)).toBe(true);
    const types = new Set(operations.ALERT_TYPES.map((one) => one.id));
    for (const one of operations.ALERTS) expect(types.has(one.type)).toBe(true);
  });

  it("has Checkout past its objective in its bad half hour, and nowhere after now", () => {
    const points = operations.metrics("checkout");
    expect(points.at(-1)!.t).toBeLessThanOrEqual(operations.NOW);
    expect(Math.max(...points.map((one) => one.p95))).toBeGreaterThan(300);
  });
});

describe("logistics", () => {
  it("has a tour per vehicle, a shipment per stop, unique ids", () => {
    expect(logistics.TOURS).toHaveLength(logistics.VEHICLES.length);
    expect(unique(logistics.SHIPMENTS.map((one) => one.id))).toBe(true);
    expect(logistics.SHIPMENTS).toHaveLength(logistics.TOURS.reduce((sum, one) => sum + one.stops.length, 0));
  });

  it("has late stops, and none before its tour leaves", () => {
    const stops = logistics.TOURS.flatMap((one) => one.stops.map((stop) => ({ stop, from: one.from })));
    expect(stops.some(({ stop }) => stop.arrival > stop.window[1])).toBe(true);
    for (const { stop, from } of stops) expect(stop.arrival).toBeGreaterThan(from);
  });
});

describe("controlling", () => {
  it("has a ledger row per cost centre and month, actuals only for closed months", () => {
    expect(controlling.LEDGER).toHaveLength(controlling.COST_CENTRES.length * 12);
    for (const row of controlling.LEDGER) {
      const closed = controlling.MONTHS.indexOf(row.month) < controlling.CLOSED_MONTHS;
      expect(row.actual === null).toBe(!closed);
    }
  });

  it("has invoices with lines, approvals for known invoices", () => {
    expect(unique(controlling.INVOICES.map((one) => one.id))).toBe(true);
    const ids = new Set(controlling.INVOICES.map((one) => one.id));
    for (const one of controlling.INVOICES) expect(one.lines.length).toBeGreaterThan(0);
    for (const one of controlling.APPROVALS) expect(ids.has(one.invoice)).toBe(true);
  });
});

describe("planning", () => {
  it("places work and leave on known people and projects", () => {
    expect(unique(planning.WORK.map((one) => one.id))).toBe(true);
    const people = new Set(planning.PEOPLE.map((one) => one.id));
    const projects = new Set(planning.PROJECTS.map((one) => one.id));
    for (const one of planning.WORK) {
      expect(people.has(one.lane)).toBe(true);
      expect(projects.has(one.task)).toBe(true);
      expect(one.to).toBeGreaterThan(one.from);
    }
    for (const one of planning.LEAVE) expect(people.has(one.person)).toBe(true);
  });

  it("puts nobody's work into their leave", () => {
    for (const leave of planning.LEAVE) {
      for (const work of planning.WORK.filter((one) => one.lane === leave.person)) {
        expect(work.to <= leave.from || work.from >= leave.to, `${work.id} in ${leave.id}`).toBe(true);
      }
    }
  });
});

describe("plant", () => {
  it("has the kiln line and the machine plan", () => {
    expect(plant.plant(7).readings).toHaveLength(plant.SHIFT_MINUTES);
    expect(unique(plant.STEPS.map((one) => one.id))).toBe(true);
  });
});
