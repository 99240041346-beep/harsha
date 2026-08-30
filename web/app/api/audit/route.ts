import {NextResponse} from "next/server";
import {db} from "../../../lib/db";
import {verify} from "../../../lib/auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:Request){if(!verify(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const {rows}=await db.query(`SELECT id,action,resource_type,resource_id,created_at FROM audit_logs ORDER BY created_at DESC LIMIT 100`);return NextResponse.json({audit:rows});}catch(e){console.error(e);return NextResponse.json({error:"Database unavailable"},{status:503});}}
