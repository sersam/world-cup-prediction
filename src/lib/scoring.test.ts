import { describe, expect, it } from "vitest";
import { calculatePredictionPoints, sortRanking } from "@/lib/scoring";

describe("calculatePredictionPoints", () => {
  it("awards 10 points for exact score", () => {
    expect(
      calculatePredictionPoints({ home: 2, away: 1 }, { home: 2, away: 1 }),
    ).toBe(10);
  });

  it("awards 5 points for correct winner without exact score", () => {
    expect(
      calculatePredictionPoints({ home: 3, away: 1 }, { home: 2, away: 0 }),
    ).toBe(5);
  });

  it("awards 5 points for correct draw sign without exact score", () => {
    expect(
      calculatePredictionPoints({ home: 2, away: 2 }, { home: 1, away: 1 }),
    ).toBe(5);
  });

  it("awards 0 points for a missed outcome", () => {
    expect(
      calculatePredictionPoints({ home: 1, away: 0 }, { home: 0, away: 2 }),
    ).toBe(0);
  });

  it("awards 2 points when the predicted winner qualifies on penalties after a draw", () => {
    expect(
      calculatePredictionPoints(
        { home: 2, away: 1 },
        { home: 1, away: 1, decidedByPenalties: true, qualifiedSide: "HOME" },
      ),
    ).toBe(2);
  });

  it("keeps exact draw at 10 points even when penalties decide the qualifier", () => {
    expect(
      calculatePredictionPoints(
        { home: 1, away: 1 },
        { home: 1, away: 1, decidedByPenalties: true, qualifiedSide: "AWAY" },
      ),
    ).toBe(10);
  });

  it("keeps a non-exact draw prediction at 5 points when penalties decide the qualifier", () => {
    expect(
      calculatePredictionPoints(
        { home: 2, away: 2 },
        { home: 1, away: 1, decidedByPenalties: true, qualifiedSide: "AWAY" },
      ),
    ).toBe(5);
  });

  it("awards 0 points when the predicted winner is not the penalty qualifier", () => {
    expect(
      calculatePredictionPoints(
        { home: 2, away: 1 },
        { home: 1, away: 1, decidedByPenalties: true, qualifiedSide: "AWAY" },
      ),
    ).toBe(0);
  });

  it("does not add qualifier bonus outside penalty shootout draws", () => {
    expect(
      calculatePredictionPoints(
        { home: 2, away: 1 },
        { home: 1, away: 0, decidedByPenalties: false, qualifiedSide: "HOME" },
      ),
    ).toBe(5);
  });
});

describe("sortRanking", () => {
  it("sorts by points descending and nickname ascending on ties", () => {
    expect(
      sortRanking([
        { id: "1", nickname: "Sergio", points: 10 },
        { id: "2", nickname: "Ana", points: 15 },
        { id: "3", nickname: "Carlos", points: 15 },
      ]),
    ).toEqual([
      { id: "2", nickname: "Ana", points: 15 },
      { id: "3", nickname: "Carlos", points: 15 },
      { id: "1", nickname: "Sergio", points: 10 },
    ]);
  });
});
