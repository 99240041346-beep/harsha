import {NextResponse} from "next/server";
import {verify} from "../admin/login/route";
let latest:any=null;
export async function GET(req:Request){if(!verify(req))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({scan:latest})}
export async function POST(req:Request){const bridge=process.env.FORENSIC_BRIDGE_SECRET;if(!bridge||req.headers.get("x-bridge-secret")!==bridge)return NextResponse.json({error:"Unauthorized bridge"},{status:401});let body:any;try{body=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}if(!body||typeof body!=="object")return NextResponse.json({error:"Invalid scan"},{status:400});latest={...body,scannedAt:body.scannedAt||new Date().toISOString()};return NextResponse.json({ok:true,scannedAt:latest.scannedAt})}
