import { createHmac, timingSafeEqual } from "crypto";

function sessionToken(email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(email).digest("hex");
}

export function verify(req: Request): boolean {
  const email = process.env.ADMIN_EMAIL;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!email || !secret) return false;
  const supplied = req.headers.get("x-harsha-admin-token") ?? "";
  const expected = sessionToken(email);
  if (!supplied || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function tokenForEmail(email: string) {
  return sessionToken(email);
}
