import { NextResponse } from "next/server";
import { db, withTransaction } from "../../../lib/db";
import { verify } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanArray(value: unknown) { return Array.isArray(value) ? value.slice(0, 5000) : []; }

export async function GET(req: Request) {
  if (!verify(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { rows } = await db.query(`SELECT s.id, s.scanned_at, s.status, s.summary,
      d.id AS device_id, d.serial, d.model, d.manufacturer, d.android_version
      FROM scans s LEFT JOIN devices d ON d.id=s.device_id ORDER BY s.scanned_at DESC LIMIT 1`);
    if (!rows[0]) return NextResponse.json({ scan: null });
    const scanId = rows[0].id;
    const [apps,sms,contacts,files,processes,findings] = await Promise.all([
      db.query("SELECT name, package_name AS package, system_app AS system, category, suspicious FROM applications WHERE scan_id=$1 ORDER BY id",[scanId]),
      db.query("SELECT address, body, message_date AS date, suspicious FROM sms_messages WHERE scan_id=$1 ORDER BY id",[scanId]),
      db.query("SELECT name, phone_number AS number FROM contacts WHERE scan_id=$1 ORDER BY id",[scanId]),
      db.query("SELECT path, size_bytes AS size, suspicious FROM files WHERE scan_id=$1 ORDER BY id",[scanId]),
      db.query("SELECT pid, name, category, suspicious FROM processes WHERE scan_id=$1 ORDER BY id",[scanId]),
      db.query("SELECT severity, title, detail FROM findings WHERE scan_id=$1 ORDER BY id",[scanId]),
    ]);
    const r=rows[0];
    return NextResponse.json({scan:{id:r.id,scannedAt:r.scanned_at,device:{model:r.model,manufacturer:r.manufacturer,android:r.android_version,serial:r.serial},apps:apps.rows,sms:sms.rows,contacts:contacts.rows,files:files.rows,processes:processes.rows,findings:findings.rows}});
  } catch (error) { console.error(error); return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}

export async function POST(req: Request) {
  const secret = process.env.FORENSIC_BRIDGE_SECRET;
  if (!secret || req.headers.get("x-bridge-secret") !== secret) return NextResponse.json({ error: "Unauthorized bridge" }, { status: 401 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body?.device?.serial) return NextResponse.json({ error: "device.serial is required" }, { status: 422 });
  try {
    const result = await withTransaction(async client => {
      const d = await client.query(`INSERT INTO devices(serial,model,manufacturer,android_version,last_seen_at) VALUES($1,$2,$3,$4,now())
        ON CONFLICT(serial) DO UPDATE SET model=EXCLUDED.model,manufacturer=EXCLUDED.manufacturer,android_version=EXCLUDED.android_version,last_seen_at=now() RETURNING id`,
        [String(body.device.serial), body.device.model || null, body.device.manufacturer || null, body.device.android || null]);
      const summary = {apps:cleanArray(body.apps).length,sms:cleanArray(body.sms).length,contacts:cleanArray(body.contacts).length,files:cleanArray(body.files).length,processes:cleanArray(body.processes).length,findings:cleanArray(body.findings).length};
      const s = await client.query("INSERT INTO scans(device_id,status,scanned_at,summary) VALUES($1,'completed',$2,$3) RETURNING id,scanned_at",[d.rows[0].id,body.scannedAt?new Date(body.scannedAt):new Date(),summary]);
      const id=s.rows[0].id;
      for(const x of cleanArray(body.apps)) await client.query("INSERT INTO applications(scan_id,name,package_name,system_app,category,suspicious) VALUES($1,$2,$3,$4,$5,$6)",[id,x.name||null,x.package||null,!!x.system,x.category||null,!!x.suspicious]);
      for(const x of cleanArray(body.sms)) await client.query("INSERT INTO sms_messages(scan_id,address,body,message_date,suspicious) VALUES($1,$2,$3,$4,$5)",[id,x.address||null,x.body||null,x.date||null,!!x.suspicious]);
      for(const x of cleanArray(body.contacts)) await client.query("INSERT INTO contacts(scan_id,name,phone_number) VALUES($1,$2,$3)",[id,x.name||null,x.number||null]);
      for(const x of cleanArray(body.files)) await client.query("INSERT INTO files(scan_id,path,size_bytes,suspicious) VALUES($1,$2,$3,$4)",[id,x.path||null,Number.isFinite(Number(x.size))?Number(x.size):null,!!x.suspicious]);
      for(const x of cleanArray(body.processes)) await client.query("INSERT INTO processes(scan_id,pid,name,category,suspicious) VALUES($1,$2,$3,$4,$5)",[id,x.pid||null,x.name||null,x.category||null,!!x.suspicious]);
      for(const x of cleanArray(body.findings)) await client.query("INSERT INTO findings(scan_id,severity,title,detail) VALUES($1,$2,$3,$4)",[id,x.severity||"INFO",x.title||"Review indicator",x.detail||null]);
      return s.rows[0];
    });
    return NextResponse.json({ok:true,scanId:result.id,scannedAt:result.scanned_at},{status:201});
  } catch(error){ console.error(error); return NextResponse.json({error:"Could not persist scan"},{status:503}); }
}
