import { db } from "../../../lib/db";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){try{const r=await db.query("SELECT now() AS database_time");return Response.json({ok:true,service:"HARSHA",database:"connected",databaseTime:r.rows[0].database_time,timestamp:new Date().toISOString()});}catch(error){console.error(error);return Response.json({ok:false,service:"HARSHA",database:"unavailable",timestamp:new Date().toISOString()},{status:503});}}
