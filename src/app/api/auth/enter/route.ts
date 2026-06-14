import { NextResponse } from "next/server";
import { z } from "zod";
import {
  hashPin,
  isValidGroupCode,
  normalizeGroupCode,
  normalizeNickname,
  setSession,
  verifyPin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const enterSchema = z.object({
  code: z.string().min(3).max(24).optional(),
  nickname: z.string().min(2).max(40),
  password: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL("/entrar?error=config", request.url));
  }

  const formData = await request.formData();
  const rawCode = formData.get("code");
  const parsed = enterSchema.safeParse({
    code: typeof rawCode === "string" && rawCode ? rawCode : undefined,
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const code = parsed.data.code ? normalizeGroupCode(parsed.data.code) : null;
  if (code && !isValidGroupCode(code)) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const group = code ? await prisma.group.findUnique({ where: { code } }) : null;
  if (code && !group) return NextResponse.redirect(new URL("/grupo?error=no-existe", request.url));

  const nickname = normalizeNickname(parsed.data.nickname);
  const existing = await prisma.user.findUnique({
    where: { nickname },
    include: { memberships: { include: { group: true }, orderBy: { joinedAt: "asc" } } },
  });

  if (existing) {
    const isValidPassword = await verifyPin(parsed.data.password, existing.pinHash);
    if (!isValidPassword) {
      return NextResponse.redirect(
        new URL(code ? `/entrar?code=${code}&error=password` : "/entrar?error=password", request.url),
      );
    }

    if (group) {
      await prisma.groupMember.upsert({
        where: { userId_groupId: { userId: existing.id, groupId: group.id } },
        create: { userId: existing.id, groupId: group.id },
        update: {},
      });
    }

    await setSession(existing.id);
    return NextResponse.redirect(
      new URL(group ? `/g/${group.code}` : existing.memberships[0] ? `/g/${existing.memberships[0].group.code}` : "/grupo", request.url),
    );
  }

  const user = await prisma.user.create({
    data: {
      nickname,
      pinHash: await hashPin(parsed.data.password),
      memberships: group
        ? {
            create: {
              groupId: group.id,
            },
          }
        : undefined,
    },
  });

  await setSession(user.id);
  return NextResponse.redirect(new URL(group ? `/g/${group.code}` : "/grupo", request.url));
}
