import { MatchStatus } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWorldCupMatches } from "@/lib/football-data";

describe("fetchWorldCupMatches", () => {
  afterEach(() => {
    delete process.env.FOOTBALL_DATA_API_TOKEN;
    vi.unstubAllGlobals();
  });

  it("maps penalty shootout winner and score details for finished matches", async () => {
    process.env.FOOTBALL_DATA_API_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [
            {
              id: 1,
              utcDate: "2026-07-10T20:00:00Z",
              status: "FINISHED",
              stage: "QUARTER_FINALS",
              group: null,
              matchday: 1,
              homeTeam: { name: "Espana", tla: "ESP" },
              awayTeam: { name: "Portugal", tla: "POR" },
              score: {
                winner: "HOME_TEAM",
                duration: "PENALTY_SHOOTOUT",
                fullTime: { home: 1, away: 1 },
                penalties: { home: 5, away: 4 },
              },
            },
          ],
        }),
      }),
    );

    await expect(fetchWorldCupMatches()).resolves.toMatchObject([
      {
        externalId: 1,
        status: MatchStatus.FINISHED,
        finalHomeGoals: 1,
        finalAwayGoals: 1,
        scoreWinner: "HOME_TEAM",
        scoreDuration: "PENALTY_SHOOTOUT",
        penaltyHomeGoals: 5,
        penaltyAwayGoals: 4,
      },
    ]);
  });

  it("clears result fields while matches are not finished", async () => {
    process.env.FOOTBALL_DATA_API_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [
            {
              id: 2,
              utcDate: "2026-07-10T20:00:00Z",
              status: "IN_PLAY",
              homeTeam: { name: "Espana", tla: "ESP" },
              awayTeam: { name: "Portugal", tla: "POR" },
              score: {
                winner: "HOME_TEAM",
                duration: "PENALTY_SHOOTOUT",
                fullTime: { home: 1, away: 1 },
                penalties: { home: 5, away: 4 },
              },
            },
          ],
        }),
      }),
    );

    await expect(fetchWorldCupMatches()).resolves.toMatchObject([
      {
        externalId: 2,
        status: MatchStatus.IN_PLAY,
        finalHomeGoals: null,
        finalAwayGoals: null,
        scoreWinner: null,
        scoreDuration: null,
        penaltyHomeGoals: null,
        penaltyAwayGoals: null,
      },
    ]);
  });
});
