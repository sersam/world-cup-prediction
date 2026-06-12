import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPin, normalizeGroupCode, normalizeNickname, setSession, verifyPin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const groupSchema = z.object({
  name: z.string().min(2).max(60),
  code: z.string().min(3).max(24),
  nickname: z.string().min(2).max(40),
  password: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const code = normalizeGroupCode(parsed.data.code);
  const existing = await prisma.group.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.redirect(new URL("/grupo?error=codigo", request.url));
  }

  const nickname = normalizeNickname(parsed.data.nickname);
  const existingUser = await prisma.user.findUnique({ where: { nickname } });
  if (existingUser) {
    const isValidPassword = await verifyPin(parsed.data.password, existingUser.pinHash);
    if (!isValidPassword) {
      return NextResponse.redirect(new URL("/grupo?error=password", request.url));
    }
    if (existingUser.groupId) {
      return NextResponse.redirect(new URL("/grupo?error=already-in-group", request.url));
    }
  }

  let userId = existingUser?.id;
  await prisma.$transaction(async (tx) => {
    if (!userId) {
      const user = await tx.user.create({
        data: {
          nickname,
          pinHash: await hashPin(parsed.data.password),
        },
      });
      userId = user.id;
    }

    const group = await tx.group.create({
      data: {
        name: parsed.data.name.trim(),
        code,
        creatorId: userId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { groupId: group.id },
    });
  });

  if (userId) {
    await setSession(userId);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
