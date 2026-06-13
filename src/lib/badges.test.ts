import { describe, expect, it } from "vitest";
import { buildUserBadges } from "@/lib/badges";

const ranking = [
  { id: "1", nickname: "Ana", points: 20 },
  { id: "2", nickname: "Luis", points: 16 },
  { id: "3", nickname: "Marta", points: 5 },
];

describe("buildUserBadges", () => {
  it("awards exact and debut badges", () => {
    const badges = buildUserBadges(
      {
        id: "1",
        predictions: [{ points: 10, matchId: "a" }],
      },
      { ranking },
    );

    expect(badges.map((badge) => badge.id)).toEqual(["exact", "debut"]);
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

  it("awards streak for three scoring predictions in match order", () => {
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

    expect(badges.map((badge) => badge.id)).toContain("streak");
  });

  it("awards complete when every target match has a prediction", () => {
    const badges = buildUserBadges(
      {
        id: "3",
        predictions: [
          { points: 0, matchId: "a" },
          { points: 0, matchId: "b" },
        ],
      },
      { ranking, targetMatchIds: ["a", "b"] },
    );

    expect(badges.map((badge) => badge.id)).toContain("complete");
  });
});
