import { MatchStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getSmartSyncReason } from "@/lib/sync";

function minutesFrom(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

describe("getSmartSyncReason", () => {
  const now = new Date("2026-06-12T20:00:00.000Z");

  it("syncs when the local calendar is empty", () => {
    expect(getSmartSyncReason([], now)).toBe("empty-calendar");
  });

  it("skips outside the match polling window", () => {
    expect(
      getSmartSyncReason(
        [{ utcDate: minutesFrom(now, 120), status: MatchStatus.TIMED }],
        now,
      ),
    ).toBeNull();
  });

  it("syncs shortly before a match starts", () => {
    expect(
      getSmartSyncReason(
        [{ utcDate: minutesFrom(now, 10), status: MatchStatus.TIMED }],
        now,
      ),
    ).toBe("match-window");
  });

  it("syncs while a match can still be awaiting a final result", () => {
    expect(
      getSmartSyncReason(
        [{ utcDate: minutesFrom(now, -180), status: MatchStatus.TIMED }],
        now,
      ),
    ).toBe("match-window");
  });

  it("syncs live matches regardless of their kickoff time", () => {
    expect(
      getSmartSyncReason(
        [{ utcDate: minutesFrom(now, -360), status: MatchStatus.IN_PLAY }],
        now,
      ),
    ).toBe("live-match");
  });
});
