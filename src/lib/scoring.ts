export type Score = {
  home: number;
  away: number;
};

export type QualifiedSide = "HOME" | "AWAY";

export type ResultScore = Score & {
  decidedByPenalties?: boolean;
  qualifiedSide?: QualifiedSide | null;
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
  result: ResultScore | null,
): number {
  if (!result) return 0;

  if (prediction.home === result.home && prediction.away === result.away) {
    return 10;
  }

  const predictionOutcome = getOutcome(prediction);
  const resultOutcome = getOutcome(result);

  if (predictionOutcome === resultOutcome) return 5;

  if (
    result.home === result.away &&
    result.decidedByPenalties &&
    result.qualifiedSide &&
    predictionOutcome !== "DRAW" &&
    predictionOutcome === result.qualifiedSide
  ) {
    return 2;
  }

  return 0;
}

export function isPenaltyShootoutResult(result: {
  scoreDuration?: string | null;
  penaltyHomeGoals?: number | null;
  penaltyAwayGoals?: number | null;
}) {
  return (
    result.scoreDuration === "PENALTY_SHOOTOUT" ||
    (result.penaltyHomeGoals !== null &&
      result.penaltyHomeGoals !== undefined &&
      result.penaltyAwayGoals !== null &&
      result.penaltyAwayGoals !== undefined)
  );
}

export function getQualifiedSideFromResult(result: {
  scoreWinner?: string | null;
  penaltyHomeGoals?: number | null;
  penaltyAwayGoals?: number | null;
}): QualifiedSide | null {
  if (result.scoreWinner === "HOME_TEAM") return "HOME";
  if (result.scoreWinner === "AWAY_TEAM") return "AWAY";

  if (
    result.penaltyHomeGoals !== null &&
    result.penaltyHomeGoals !== undefined &&
    result.penaltyAwayGoals !== null &&
    result.penaltyAwayGoals !== undefined
  ) {
    if (result.penaltyHomeGoals > result.penaltyAwayGoals) return "HOME";
    if (result.penaltyHomeGoals < result.penaltyAwayGoals) return "AWAY";
  }

  return null;
}

export function sortRanking<T extends RankingEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.nickname.localeCompare(b.nickname, "es", { sensitivity: "base" });
  });
}
