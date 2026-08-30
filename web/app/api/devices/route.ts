import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {verify} from "../admin/login/route";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:Request){if(!verify(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const {rows}=await db.query(`SELECT d.id,d.serial,d.model,d.manufacturer,d.android_version,d.first_seen_at,d.last_seen_at,COUNT(s.id)::int AS scan_count FROM devices d LEFT JOIN scans s ON s.device_id=d.id GROUP BY d.id ORDER BY d.last_seen_at DESC NULLS LAST`);return NextResponse.json({devices:rows});}catch(e){console.error(e);return NextResponse.json({error:"Database unavailable"},{status:503});}}
