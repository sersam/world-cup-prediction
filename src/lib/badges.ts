import type { RankingEntry } from "@/lib/scoring";

export type BadgeId = "hunter" | "exact" | "streak" | "complete" | "debut";

export type Badge = {
  id: BadgeId;
  icon: "bolt" | "target" | "flame" | "checklist" | "pencil";
  label: string;
  description: string;
  tone: "blue" | "green" | "red" | "dark" | "cream";
};

type BadgePrediction = {
  matchId?: string;
  points: number;
  match?: {
    utcDate: Date;
  } | null;
};

type BadgeUser = {
  id: string;
  predictions: BadgePrediction[];
};

type BadgeContext = {
  ranking: RankingEntry[];
  targetMatchIds?: string[];
};

const badgeDefinitions: Record<BadgeId, Badge> = {
  hunter: {
    id: "hunter",
    icon: "bolt",
    label: "Cazador",
    description: "Esta a 5 puntos o menos del lider.",
    tone: "blue",
  },
  exact: {
    id: "exact",
    icon: "target",
    label: "Exacto",
    description: "Ha acertado un marcador exacto.",
    tone: "green",
  },
  streak: {
    id: "streak",
    icon: "flame",
    label: "Racha x3",
    description: "Ha puntuado en 3 partidos seguidos.",
    tone: "red",
  },
  complete: {
    id: "complete",
    icon: "checklist",
    label: "Completo",
    description: "Tiene guardadas todas las predicciones visibles.",
    tone: "dark",
  },
  debut: {
    id: "debut",
    icon: "pencil",
    label: "Debut",
    description: "Ya hizo su primera prediccion.",
    tone: "cream",
  },
};

function longestScoringStreak(predictions: BadgePrediction[]) {
  return predictions
    .filter((prediction) => prediction.match?.utcDate)
    .sort((a, b) => Number(a.match?.utcDate) - Number(b.match?.utcDate))
    .reduce(
      (state, prediction) => {
        const current = prediction.points > 0 ? state.current + 1 : 0;
        return { current, best: Math.max(state.best, current) };
      },
      { current: 0, best: 0 },
    ).best;
}

function hasCompletedTargets(user: BadgeUser, targetMatchIds: string[]) {
  if (targetMatchIds.length === 0) return false;

  const predictedMatchIds = new Set(
    user.predictions
      .map((prediction) => prediction.matchId)
      .filter((matchId): matchId is string => Boolean(matchId)),
  );

  return targetMatchIds.every((matchId) => predictedMatchIds.has(matchId));
}

export function buildUserBadges(user: BadgeUser, context: BadgeContext): Badge[] {
  const badges: Badge[] = [];
  const rankIndex = context.ranking.findIndex((entry) => entry.id === user.id);
  const rankingEntry = rankIndex >= 0 ? context.ranking[rankIndex] : null;
  const leader = context.ranking[0];

  if (
    rankIndex > 0 &&
    leader &&
    rankingEntry &&
    leader.points > rankingEntry.points &&
    leader.points - rankingEntry.points <= 5
  ) {
    badges.push(badgeDefinitions.hunter);
  }

  if (user.predictions.some((prediction) => prediction.points >= 10)) {
    badges.push(badgeDefinitions.exact);
  }

  if (longestScoringStreak(user.predictions) >= 3) {
    badges.push(badgeDefinitions.streak);
  }

  if (hasCompletedTargets(user, context.targetMatchIds ?? [])) {
    badges.push(badgeDefinitions.complete);
  }

  if (user.predictions.length > 0) {
    badges.push(badgeDefinitions.debut);
  }

  return badges;
}

export function buildGroupBadges(users: BadgeUser[], context: BadgeContext) {
  return new Map(users.map((user) => [user.id, buildUserBadges(user, context)]));
}
