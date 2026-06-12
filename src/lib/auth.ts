import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "worldcup_session";
const FALLBACK_SECRET = "dev-secret-change-me";

function getSecret() {
  return process.env.SESSION_SECRET || FALLBACK_SECRET;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function verify(value: string, signature: string) {
  const expected = sign(value);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normalizeNickname(nickname: string) {
  return nickname.trim().replace(/\s+/g, " ");
}

export function normalizeGroupCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  const value = `${userId}.${sign(userId)}`;
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [userId, signature] = raw.split(".");
  if (!userId || !signature || !verify(userId, signature)) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { group: true },
  });
}
