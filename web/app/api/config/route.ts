import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){const required=["DATABASE_URL","ADMIN_EMAIL","ADMIN_PASSWORD","ADMIN_SESSION_SECRET","FORENSIC_BRIDGE_SECRET"];const configured=Object.fromEntries(required.map(k=>[k,Boolean(process.env[k])]));let database=false;try{await db.query("SELECT 1");database=true}catch{}return NextResponse.json({ok:Object.values(configured).every(Boolean)&&database,environment:Object.fromEntries(Object.entries(configured).map(([k,v])=>[k,v?"configured":"missing"])),database:database?"connected":"unavailable"},{status:Object.values(configured).every(Boolean)&&database?200:503});}
