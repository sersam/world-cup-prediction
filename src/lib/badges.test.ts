import { describe, expect, it } from "vitest";
import { buildUserBadges } from "@/lib/badges";

const ranking = [
  { id: "1", nickname: "Ana", points: 20 },
  { id: "2", nickname: "Luis", points: 16 },
  { id: "3", nickname: "Marta", points: 5 },
];

describe("buildUserBadges", () => {
  it("awards exact badge", () => {
    const badges = buildUserBadges(
      {
        id: "1",
        predictions: [{ points: 10, matchId: "a" }],
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toEqual(["exact"]);
  });

  it.each([
    { count: 3, expected: "exact3" },
    { count: 5, expected: "exact5" },
    { count: 10, expected: "exact10" },
  ])("keeps only the best exact badge for $count exact results", ({ count, expected }) => {
    const badges = buildUserBadges(
      {
        id: "1",
        predictions: Array.from({ length: count }, (_, index) => ({
          points: 10,
          matchId: String(index),
        })),
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toEqual([expected]);
  });

  it("awards hunter when a user is close to the leader", () => {
    const badges = buildUserBadges(
      {
        id: "2",
        predictions: [{ points: 5, matchId: "a" }],
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toContain("hunter");
  });

  it("awards streak x3 for three scoring predictions in match order", () => {
    const badges = buildUserBadges(
      {
        id: "3",
        predictions: [
          { points: 5, matchId: "b", match: { utcDate: new Date("2026-06-12T12:00:00Z") } },
          { points: 5, matchId: "a", match: { utcDate: new Date("2026-06-11T12:00:00Z") } },
          { points: 10, matchId: "c", match: { utcDate: new Date("2026-06-13T12:00:00Z") } },
        ],
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toContain("streak3");
  });

  it("keeps only the best streak badge", () => {
    const predictions = Array.from({ length: 10 }, (_, index) => ({
      points: index === 0 ? 10 : 5,
      matchId: String(index),
      match: { utcDate: new Date(Date.UTC(2026, 5, index + 1, 12)) },
    }));

    const badges = buildUserBadges(
      {
        id: "3",
        predictions,
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toEqual(["exact", "streak10"]);
  });

  it("replaces streak x3 with streak x5", () => {
    const predictions = Array.from({ length: 5 }, (_, index) => ({
      points: 5,
      matchId: String(index),
      match: { utcDate: new Date(Date.UTC(2026, 5, index + 1, 12)) },
    }));

    const badges = buildUserBadges(
      {
        id: "3",
        predictions,
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toEqual(["streak5"]);
  });
});
