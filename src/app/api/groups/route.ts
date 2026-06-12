import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, normalizeGroupCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const groupSchema = z.object({
  name: z.string().min(2).max(60),
  code: z.string().min(3).max(24),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", request.url));
  if (user.groupId) return NextResponse.redirect(new URL("/?error=already-in-group", request.url));

  const formData = await request.formData();
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const code = normalizeGroupCode(parsed.data.code);
  const existing = await prisma.group.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.redirect(new URL("/grupo?error=codigo", request.url));
  }

  await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: parsed.data.name.trim(),
        code,
        creatorId: user.id,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { groupId: group.id },
    });
  });

  return NextResponse.redirect(new URL("/", request.url));
}
