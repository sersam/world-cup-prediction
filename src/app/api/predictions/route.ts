import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isPredictionOpen } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { calculatePredictionPoints } from "@/lib/scoring";

const predictionSchema = z.object({
  matchId: z.string().min(1),
  predictedHome: z.coerce.number().int().min(0).max(99),
  predictedAway: z.coerce.number().int().min(0).max(99),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));
  if (!user.groupId) return NextResponse.redirect(new URL("/grupo", request.url));

  const formData = await request.formData();
  const parsed = predictionSchema.safeParse({
    matchId: formData.get("matchId"),
    predictedHome: formData.get("predictedHome"),
    predictedAway: formData.get("predictedAway"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/?error=prediccion", request.url));
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
  });

  if (!match || !isPredictionOpen(match.utcDate)) {
    return NextResponse.redirect(new URL("/?error=cerrado", request.url));
  }

  const hasResult = match.finalHomeGoals !== null && match.finalAwayGoals !== null;
  const points = calculatePredictionPoints(
    { home: parsed.data.predictedHome, away: parsed.data.predictedAway },
    hasResult
      ? { home: match.finalHomeGoals ?? 0, away: match.finalAwayGoals ?? 0 }
      : null,
  );

  await prisma.prediction.upsert({
    where: {
      userId_groupId_matchId: {
        userId: user.id,
        groupId: user.groupId,
        matchId: match.id,
      },
    },
    create: {
      userId: user.id,
      groupId: user.groupId,
      matchId: match.id,
      predictedHome: parsed.data.predictedHome,
      predictedAway: parsed.data.predictedAway,
      points,
      scoredAt: hasResult ? new Date() : null,
    },
    update: {
      predictedHome: parsed.data.predictedHome,
      predictedAway: parsed.data.predictedAway,
      points,
      scoredAt: hasResult ? new Date() : null,
    },
  });

  return NextResponse.redirect(new URL("/", request.url));
}
