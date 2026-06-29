import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isValidGroupCode, normalizeGroupCode } from "@/lib/auth";
import { isPredictionOpen } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  calculatePredictionPoints,
  getQualifiedSideFromResult,
  isPenaltyShootoutResult,
} from "@/lib/scoring";

const predictionSchema = z.object({
  groupCode: z.string().min(3).max(24),
  matchId: z.string().min(1),
  predictedHome: z.coerce.number().int().min(0).max(99),
  predictedAway: z.coerce.number().int().min(0).max(99),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));

  const formData = await request.formData();
  const parsed = predictionSchema.safeParse({
    groupCode: formData.get("groupCode"),
    matchId: formData.get("matchId"),
    predictedHome: formData.get("predictedHome"),
    predictedAway: formData.get("predictedAway"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/?error=prediccion", request.url));
  }

  const groupCode = normalizeGroupCode(parsed.data.groupCode);
  if (!isValidGroupCode(groupCode)) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const membership = user.memberships.find(
    (item) => item.group.code === groupCode,
  );
  if (!membership) return NextResponse.redirect(new URL("/grupo", request.url));

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
  });

  if (!match || !isPredictionOpen(match.utcDate)) {
    return NextResponse.redirect(new URL(`/g/${membership.group.code}?error=cerrado`, request.url));
  }

  const hasResult = match.finalHomeGoals !== null && match.finalAwayGoals !== null;
  const points = calculatePredictionPoints(
    {
      home: parsed.data.predictedHome,
      away: parsed.data.predictedAway,
    },
    hasResult
      ? {
          home: match.finalHomeGoals ?? 0,
          away: match.finalAwayGoals ?? 0,
          decidedByPenalties: isPenaltyShootoutResult(match),
          qualifiedSide: getQualifiedSideFromResult(match),
        }
      : null,
  );

  await prisma.prediction.upsert({
    where: {
      userId_groupId_matchId: {
        userId: user.id,
        groupId: membership.groupId,
        matchId: match.id,
      },
    },
    create: {
      userId: user.id,
      groupId: membership.groupId,
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

  return NextResponse.redirect(new URL(`/g/${membership.group.code}`, request.url));
}
