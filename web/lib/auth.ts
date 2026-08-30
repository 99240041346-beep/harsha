import { createHmac, timingSafeEqual } from "crypto";

function token(email: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(email).digest("hex");
}

export function verify(req: Request) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_SESSION_SECRET) return false;
  const cookie = req.headers.get("cookie")?.match(/(?:^|; )harsha_admin=([^;]+)/)?.[1];
  if (!cookie) return false;
  const expected = Buffer.from(token(process.env.ADMIN_EMAIL));
  const actual = Buffer.from(cookie);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
