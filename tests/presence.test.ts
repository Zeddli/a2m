import { describe, expect, it } from "vitest";
import { isAgentActive } from "../lib/server/presence";

// Verifies active presence computation based on heartbeat freshness.
describe("agent presence", () => {
  it("returns true for recent heartbeat", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");
    const lastHeartbeat = new Date("2026-01-01T09:55:30.000Z");
    expect(isAgentActive(lastHeartbeat, false, now, 10)).toBe(true);
  });

  it("returns false for stale heartbeat", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");
    const lastHeartbeat = new Date("2026-01-01T09:40:00.000Z");
    expect(isAgentActive(lastHeartbeat, false, now, 10)).toBe(false);
  });

  it("returns false when manually disabled", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");
    const lastHeartbeat = new Date("2026-01-01T09:59:00.000Z");
    expect(isAgentActive(lastHeartbeat, true, now, 10)).toBe(false);
  });
});
