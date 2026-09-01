import { NextResponse } from "next/server";
import { tokenForEmail } from "../../../lib/admin-auth";

export async function POST(req: Request) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin environment is not configured" }, { status: 503 });
  }
  let body: { email?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = String(body.email || "");
  const password = String(body.password || "");
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("harsha_admin", tokenForEmail(email), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 28800 });
  return response;
}
