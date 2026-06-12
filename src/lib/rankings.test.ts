import { describe, expect, it } from "vitest";
import { buildRanking } from "@/lib/rankings";

describe("buildRanking", () => {
  it("includes users with zero points and sorts the table", () => {
    expect(
      buildRanking([
        { id: "1", nickname: "Luis", predictions: [] },
        { id: "2", nickname: "Maria", predictions: [{ points: 5 }, { points: 10 }] },
        { id: "3", nickname: "Belen", predictions: [{ points: 15 }] },
      ]),
    ).toEqual([
      { id: "3", nickname: "Belen", points: 15 },
      { id: "2", nickname: "Maria", points: 15 },
      { id: "1", nickname: "Luis", points: 0 },
    ]);
  });
});
