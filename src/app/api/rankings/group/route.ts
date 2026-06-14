import { NextResponse } from "next/server";
import { getCurrentUser, normalizeGroupCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ranking: [] });

  const rawCode = new URL(request.url).searchParams.get("code");
  const code = rawCode ? normalizeGroupCode(rawCode) : null;
  const membership = code
    ? user.memberships.find((item) => item.group.code === code)
    : user.memberships[0];
  if (!membership) return NextResponse.json({ ranking: [] });

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: { groupId: membership.groupId },
      },
    },
    include: { predictions: { where: { groupId: membership.groupId } } },
  });

  return NextResponse.json({ ranking: buildRanking(users) });
}
