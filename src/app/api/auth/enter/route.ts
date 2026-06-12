import { NextResponse } from "next/server";
import { z } from "zod";
import {
  hashPin,
  normalizeGroupCode,
  normalizeNickname,
  setSession,
  verifyPin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const enterSchema = z.object({
  code: z.string().min(3).max(24),
  nickname: z.string().min(2).max(40),
  password: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL("/entrar?error=config", request.url));
  }

  const formData = await request.formData();
  const parsed = enterSchema.safeParse({
    code: formData.get("code"),
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const code = normalizeGroupCode(parsed.data.code);
  const group = await prisma.group.findUnique({ where: { code } });
  if (!group) {
    return NextResponse.redirect(new URL("/grupo?error=no-existe", request.url));
  }

  const nickname = normalizeNickname(parsed.data.nickname);
  const existing = await prisma.user.findUnique({ where: { nickname } });

  if (existing) {
    const isValidPassword = await verifyPin(parsed.data.password, existing.pinHash);
    if (!isValidPassword) {
      return NextResponse.redirect(new URL(`/entrar?code=${code}&error=password`, request.url));
    }

    if (existing.groupId && existing.groupId !== group.id) {
      return NextResponse.redirect(new URL(`/entrar?code=${code}&error=already-in-group`, request.url));
    }

    if (!existing.groupId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { groupId: group.id },
      });
    }

    await setSession(existing.id);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const user = await prisma.user.create({
    data: {
      nickname,
      pinHash: await hashPin(parsed.data.password),
      groupId: group.id,
    },
  });

  await setSession(user.id);
  return NextResponse.redirect(new URL("/", request.url));
}
