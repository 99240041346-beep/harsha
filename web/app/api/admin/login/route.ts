import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function token(email: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(email).digest("hex");
}

export async function POST(req: Request) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin environment is not configured" }, { status: 503 });
  }
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = String(body.email || "");
  const password = String(body.password || "");
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("harsha_admin", token(email), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
  return response;
}

export async function GET(req: Request) {
  return NextResponse.json({ authenticated: verifyAdminCookie(req) });
}

export function verifyAdminCookie(req: Request) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_SESSION_SECRET) return false;
  const cookie = req.headers.get("cookie")?.match(/(?:^|; )harsha_admin=([^;]+)/)?.[1];
  if (!cookie) return false;
  const expected = Buffer.from(token(process.env.ADMIN_EMAIL));
  const actual = Buffer.from(cookie);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
