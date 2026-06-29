import { MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  calculatePredictionPoints,
  getQualifiedSideFromResult,
  isPenaltyShootoutResult,
} from "@/lib/scoring";
import { fetchWorldCupMatches } from "@/lib/football-data";

const SMART_SYNC_LOOKAHEAD_MINUTES = 15;
const SMART_SYNC_FOLLOW_UP_MINUTES = 240;

type SmartSyncMatch = {
  utcDate: Date;
  status: MatchStatus;
};

export function getSmartSyncReason(matches: SmartSyncMatch[], now = new Date()) {
  if (matches.length === 0) return "empty-calendar";

  const lookaheadMs = SMART_SYNC_LOOKAHEAD_MINUTES * 60 * 1000;
  const followUpMs = SMART_SYNC_FOLLOW_UP_MINUTES * 60 * 1000;
  const nowTime = now.getTime();

  for (const match of matches) {
    if (match.status === MatchStatus.IN_PLAY || match.status === MatchStatus.PAUSED) {
      return "live-match";
    }

    const matchTime = match.utcDate.getTime();
    const syncWindowStart = matchTime - lookaheadMs;
    const syncWindowEnd = matchTime + followUpMs;

    if (nowTime >= syncWindowStart && nowTime <= syncWindowEnd) {
      return "match-window";
    }
  }

  return null;
}

export async function syncWorldCupMatches() {
  const matches = await fetchWorldCupMatches();

  for (const match of matches) {
    await prisma.match.upsert({
      where: { externalId: match.externalId },
      create: match,
      update: match,
    });
  }

  await scoreFinishedPredictions();

  return { synced: matches.length };
}

export async function smartSyncWorldCupMatches() {
  const windowStart = new Date(
    Date.now() - SMART_SYNC_FOLLOW_UP_MINUTES * 60 * 1000,
  );
  const windowEnd = new Date(
    Date.now() + SMART_SYNC_LOOKAHEAD_MINUTES * 60 * 1000,
  );
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          utcDate: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        {
          status: {
            in: [MatchStatus.IN_PLAY, MatchStatus.PAUSED],
          },
        },
      ],
    },
    select: {
      utcDate: true,
      status: true,
    },
  });
  const totalMatches = await prisma.match.count();
  const reason = getSmartSyncReason(
    totalMatches === 0 ? [] : matches,
  );

  if (!reason) {
    return { mode: "smart", skipped: true, reason: "outside-match-window", synced: 0 };
  }

  const result = await syncWorldCupMatches();
  return { mode: "smart", skipped: false, reason, ...result };
}

export async function scoreFinishedPredictions() {
  const predictions = await prisma.prediction.findMany({
    include: { match: true },
  });

  for (const prediction of predictions) {
    const hasResult =
      prediction.match.finalHomeGoals !== null &&
      prediction.match.finalAwayGoals !== null;

    const points = calculatePredictionPoints(
      {
        home: prediction.predictedHome,
        away: prediction.predictedAway,
      },
      hasResult
        ? {
            home: prediction.match.finalHomeGoals ?? 0,
            away: prediction.match.finalAwayGoals ?? 0,
            decidedByPenalties: isPenaltyShootoutResult(prediction.match),
            qualifiedSide: getQualifiedSideFromResult(prediction.match),
          }
        : null,
    );

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        points,
        scoredAt: hasResult ? new Date() : null,
      },
    });
  }

  const users = await prisma.user.findMany({
    include: { predictions: true },
  });

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPoints: user.predictions.reduce(
          (total, prediction) => total + prediction.points,
          0,
        ),
      },
    });
  }
}
