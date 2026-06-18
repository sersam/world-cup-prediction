import type { RankingEntry } from "@/lib/scoring";

export type BadgeId =
  | "hunter"
  | "exact"
  | "exact3"
  | "exact5"
  | "exact10"
  | "streak3"
  | "streak5"
  | "streak10";

export type Badge = {
  id: BadgeId;
  icon: "bolt" | "target" | "target3" | "target5" | "target10" | "flame3" | "flame5" | "flame10";
  label: string;
  description: string;
  tone: "blue" | "green" | "red" | "gold" | "dark";
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
  exact3: {
    id: "exact3",
    icon: "target3",
    label: "Exacto x3",
    description: "Ha acertado 3 marcadores exactos.",
    tone: "blue",
  },
  exact5: {
    id: "exact5",
    icon: "target5",
    label: "Exacto x5",
    description: "Ha acertado 5 marcadores exactos.",
    tone: "red",
  },
  exact10: {
    id: "exact10",
    icon: "target10",
    label: "Exacto x10",
    description: "Ha acertado 10 marcadores exactos.",
    tone: "gold",
  },
  streak3: {
    id: "streak3",
    icon: "flame3",
    label: "Racha x3",
    description: "Ha puntuado en 3 partidos seguidos.",
    tone: "blue",
  },
  streak5: {
    id: "streak5",
    icon: "flame5",
    label: "Racha x5",
    description: "Ha puntuado en 5 partidos seguidos.",
    tone: "red",
  },
  streak10: {
    id: "streak10",
    icon: "flame10",
    label: "Racha x10",
    description: "Ha puntuado en 10 partidos seguidos.",
    tone: "gold",
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

  const exactResults = user.predictions.filter((prediction) => prediction.points >= 10).length;

  if (exactResults >= 10) {
    badges.push(badgeDefinitions.exact10);
  } else if (exactResults >= 5) {
    badges.push(badgeDefinitions.exact5);
  } else if (exactResults >= 3) {
    badges.push(badgeDefinitions.exact3);
  } else if (exactResults >= 1) {
    badges.push(badgeDefinitions.exact);
  }

  const scoringStreak = longestScoringStreak(user.predictions);

  if (scoringStreak >= 10) {
    badges.push(badgeDefinitions.streak10);
  } else if (scoringStreak >= 5) {
    badges.push(badgeDefinitions.streak5);
  } else if (scoringStreak >= 3) {
    badges.push(badgeDefinitions.streak3);
  }

  return badges;
}

export function buildGroupBadges(users: BadgeUser[], context: BadgeContext) {
  return new Map(users.map((user) => [user.id, buildUserBadges(user, context)]));
}
