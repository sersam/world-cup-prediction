export type Score = {
  home: number;
  away: number;
};

export type RankingEntry = {
  id: string;
  nickname: string;
  points: number;
};

export function getOutcome(score: Score): "HOME" | "AWAY" | "DRAW" {
  if (score.home > score.away) return "HOME";
  if (score.home < score.away) return "AWAY";
  return "DRAW";
}

export function calculatePredictionPoints(
  prediction: Score,
  result: Score | null,
): number {
  if (!result) return 0;

  if (prediction.home === result.home && prediction.away === result.away) {
    return 10;
  }

  return getOutcome(prediction) === getOutcome(result) ? 5 : 0;
}

export function sortRanking<T extends RankingEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.nickname.localeCompare(b.nickname, "es", { sensitivity: "base" });
  });
}
