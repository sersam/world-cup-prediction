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

  it("derives match and shootout scores when fullTime includes penalties", async () => {
    process.env.FOOTBALL_DATA_API_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [
            {
              id: 3,
              utcDate: "2026-06-30T01:00:00Z",
              status: "FINISHED",
              stage: "LAST_32",
              homeTeam: { name: "Netherlands", tla: "NED" },
              awayTeam: { name: "Morocco", tla: "MAR" },
              score: {
                winner: null,
                duration: "PENALTY_SHOOTOUT",
                fullTime: { home: 3, away: 4 },
                regularTime: { home: 1, away: 1 },
                extraTime: { home: 0, away: 0 },
                penalties: { home: 3, away: 3 },
              },
            },
          ],
        }),
      }),
    );

    await expect(fetchWorldCupMatches()).resolves.toMatchObject([
      {
        externalId: 3,
        status: MatchStatus.FINISHED,
        finalHomeGoals: 1,
        finalAwayGoals: 1,
        scoreWinner: null,
        scoreDuration: "PENALTY_SHOOTOUT",
        penaltyHomeGoals: 2,
        penaltyAwayGoals: 3,
      },
    ]);
  });

  it("uses regular time plus extra time as the final score when available", async () => {
    process.env.FOOTBALL_DATA_API_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [
            {
              id: 4,
              utcDate: "2026-07-02T20:00:00Z",
              status: "FINISHED",
              stage: "LAST_32",
              homeTeam: { name: "Espana", tla: "ESP" },
              awayTeam: { name: "Portugal", tla: "POR" },
              score: {
                winner: "HOME_TEAM",
                duration: "EXTRA_TIME",
                fullTime: { home: 2, away: 1 },
                regularTime: { home: 1, away: 1 },
                extraTime: { home: 1, away: 0 },
              },
            },
          ],
        }),
      }),
    );

    await expect(fetchWorldCupMatches()).resolves.toMatchObject([
      {
        externalId: 4,
        status: MatchStatus.FINISHED,
        finalHomeGoals: 2,
        finalAwayGoals: 1,
        scoreWinner: "HOME_TEAM",
        scoreDuration: "EXTRA_TIME",
        penaltyHomeGoals: null,
        penaltyAwayGoals: null,
      },
    ]);
  });

  it("falls back to fullTime when regularTime is empty", async () => {
    process.env.FOOTBALL_DATA_API_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [
            {
              id: 5,
              utcDate: "2026-07-01T20:00:00Z",
              status: "FINISHED",
              stage: "LAST_32",
              homeTeam: { name: "Belgium", tla: "BEL" },
              awayTeam: { name: "Senegal", tla: "SEN" },
              score: {
                winner: "HOME_TEAM",
                duration: "REGULAR",
                fullTime: { home: 3, away: 2 },
                regularTime: { home: null, away: null },
                extraTime: { home: 1, away: 0 },
              },
            },
          ],
        }),
      }),
    );

    await expect(fetchWorldCupMatches()).resolves.toMatchObject([
      {
        externalId: 5,
        status: MatchStatus.FINISHED,
        finalHomeGoals: 3,
        finalAwayGoals: 2,
        scoreWinner: "HOME_TEAM",
        scoreDuration: "REGULAR",
        penaltyHomeGoals: null,
        penaltyAwayGoals: null,
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
