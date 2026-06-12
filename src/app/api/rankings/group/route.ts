import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.groupId) return NextResponse.json({ ranking: [] });

  const users = await prisma.user.findMany({
    where: { groupId: user.groupId },
    include: { predictions: { where: { groupId: user.groupId } } },
  });

  return NextResponse.json({ ranking: buildRanking(users) });
}
