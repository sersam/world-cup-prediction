import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isValidGroupCode, normalizeGroupCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const joinSchema = z.object({
  code: z.string().min(3).max(24),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const formData = await request.formData();
  const parsed = joinSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const code = normalizeGroupCode(parsed.data.code);
  if (!isValidGroupCode(code)) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const group = await prisma.group.findUnique({
    where: { code },
  });

  if (!group) {
    return NextResponse.redirect(new URL("/grupo?error=no-existe", request.url));
  }

  if (!user) return NextResponse.redirect(new URL(`/entrar?code=${group.code}`, request.url));

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: user.id, groupId: group.id } },
    create: { userId: user.id, groupId: group.id },
    update: {},
  });

  return NextResponse.redirect(new URL(`/g/${group.code}`, request.url));
}
