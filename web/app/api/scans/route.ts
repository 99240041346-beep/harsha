import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { verify } from "../../../lib/auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:Request){if(!verify(req))return NextResponse.json({error:"Unauthorized"},{status:401});const url=new URL(req.url);const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||20),1),100);try{const {rows}=await db.query(`SELECT s.id,s.scanned_at,s.status,s.summary,d.serial,d.model,d.manufacturer,d.android_version FROM scans s LEFT JOIN devices d ON d.id=s.device_id ORDER BY s.scanned_at DESC LIMIT $1`,[limit]);return NextResponse.json({scans:rows});}catch(e){console.error(e);return NextResponse.json({error:"Database unavailable"},{status:503});}}
