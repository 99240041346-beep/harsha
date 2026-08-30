export async function GET() {
  return Response.json({ ok: true, service: "HARSHA", timestamp: new Date().toISOString() });
}
