import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "smu_admin_session";

export function getAdminConfigurationError() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!password || password.length < 10) {
    return "ADMIN_PASSWORD를 10자 이상으로 설정해주세요.";
  }
  if (!secret || secret.length < 32) {
    return "ADMIN_SESSION_SECRET을 32자 이상으로 설정해주세요.";
  }
  return null;
}

function adminSecret() {
  return getAdminConfigurationError() ? null : process.env.ADMIN_SESSION_SECRET ?? null;
}

function digest(value: string) { return createHash("sha256").update(value).digest(); }
export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(digest(password), digest(expected));
}

export function createAdminToken() {
  const secret = adminSecret(); if (!secret) return null;
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const signature = createHmac("sha256", secret).update(String(expires)).digest("hex");
  return `${expires}.${signature}`;
}

export function isValidAdminToken(cookie: string | undefined) {
  const secret = adminSecret(); if (!secret) return false;
  if (!cookie) return false;
  const [expiresText, signature] = cookie.split("."); const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false;
  const expected = createHmac("sha256", secret).update(expiresText).digest("hex");
  return timingSafeEqual(digest(signature), digest(expected));
}

export function isValidAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  return isValidAdminToken(cookie);
}

export function isSameOriginRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}
