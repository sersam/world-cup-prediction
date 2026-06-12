import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeGroupCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const joinSchema = z.object({
  code: z.string().min(3).max(24),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = joinSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/grupo?error=datos", request.url));
  }

  const group = await prisma.group.findUnique({
    where: { code: normalizeGroupCode(parsed.data.code) },
  });

  if (!group) {
    return NextResponse.redirect(new URL("/grupo?error=no-existe", request.url));
  }

  return NextResponse.redirect(new URL(`/entrar?code=${group.code}`, request.url));
}
