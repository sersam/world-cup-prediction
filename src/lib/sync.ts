import { prisma } from "@/lib/prisma";
import { calculatePredictionPoints } from "@/lib/scoring";
import { fetchWorldCupMatches } from "@/lib/football-data";

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

export async function scoreFinishedPredictions() {
  const predictions = await prisma.prediction.findMany({
    include: { match: true },
  });

  for (const prediction of predictions) {
    const hasResult =
      prediction.match.finalHomeGoals !== null &&
      prediction.match.finalAwayGoals !== null;

    const points = calculatePredictionPoints(
      { home: prediction.predictedHome, away: prediction.predictedAway },
      hasResult
        ? {
            home: prediction.match.finalHomeGoals ?? 0,
            away: prediction.match.finalAwayGoals ?? 0,
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
