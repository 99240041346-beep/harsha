function authorized(request: Request): boolean {
  const expected = process.env.HARSHA_API_SECRET;
  if (!expected) return true;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({error:"Unauthorized"},{status:401});
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({error:"Invalid JSON"},{status:400}); }
  const command = typeof body === "object" && body !== null && "command" in body && typeof (body as {command?:unknown}).command === "string"
    ? (body as {command:string}).command.trim() : "";
  if (!command) return Response.json({error:"command is required"},{status:400});
  return Response.json({assistant:"HARSHA", received:command, action:{type:"UNRESOLVED",message:"Command received. AI tool planning will be connected next."}});
}
