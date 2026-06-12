import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRanking } from "@/lib/rankings";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { predictions: true },
  });

  return NextResponse.json({ ranking: buildRanking(users) });
}
