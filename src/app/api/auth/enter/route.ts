import { NextResponse } from "next/server";
import { z } from "zod";
import {
  hashPin,
  normalizeNickname,
  setSession,
  verifyPin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const enterSchema = z.object({
  nickname: z.string().min(2).max(40),
  password: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL("/entrar?error=config", request.url));
  }

  const formData = await request.formData();
  const parsed = enterSchema.safeParse({
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/entrar?error=datos", request.url));
  }

  const nickname = normalizeNickname(parsed.data.nickname);
  const existing = await prisma.user.findUnique({ where: { nickname } });

  if (existing) {
    const isValidPassword = await verifyPin(parsed.data.password, existing.pinHash);
    if (!isValidPassword) {
      return NextResponse.redirect(new URL("/entrar?error=password", request.url));
    }

    await setSession(existing.id);
    return NextResponse.redirect(new URL(existing.groupId ? "/" : "/grupo", request.url));
  }

  const user = await prisma.user.create({
    data: {
      nickname,
      pinHash: await hashPin(parsed.data.password),
    },
  });

  await setSession(user.id);
  return NextResponse.redirect(new URL("/grupo", request.url));
}
