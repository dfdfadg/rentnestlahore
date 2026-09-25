import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const SESSION_COOKIE = "rn_session";
const SESSION_DAYS = 30;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (min 16 chars)");
    return "insecure-development-secret";
  }
  return s;
}

/** Tokens are never stored in plain text — only an HMAC of the token is saved. */
export function hashToken(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

export type CurrentUser = { id: string; name: string; email: string; phone: string | null; role: "USER" | "AGENT" | "ADMIN" };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, disabled: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.disabled) return null;
  const { disabled: _disabled, ...user } = session.user;
  void _disabled;
  return user;
});

export async function requireUser(nextPath = "/dashboard/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login/?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Admin pages 404 for everyone else so their existence is not advertised. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  return user;
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "ADMIN";
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
