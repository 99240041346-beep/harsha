CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), serial TEXT UNIQUE NOT NULL,
  model TEXT, manufacturer TEXT, android_version TEXT, first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed', scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(), summary JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  name TEXT, package_name TEXT, system_app BOOLEAN NOT NULL DEFAULT false, category TEXT, suspicious BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS sms_messages (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  address TEXT, body TEXT, message_date TEXT, suspicious BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  name TEXT, phone_number TEXT
);
CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  path TEXT, size_bytes BIGINT, suspicious BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS processes (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  pid TEXT, name TEXT, category TEXT, suspicious BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS findings (
  id BIGSERIAL PRIMARY KEY, scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'INFO', title TEXT NOT NULL, detail TEXT
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY, admin_email TEXT, action TEXT NOT NULL, target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scans_device_time ON scans(device_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_scan ON findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_apps_scan ON applications(scan_id);
CREATE INDEX IF NOT EXISTS idx_sms_scan ON sms_messages(scan_id);
CREATE INDEX IF NOT EXISTS idx_contacts_scan ON contacts(scan_id);
CREATE INDEX IF NOT EXISTS idx_files_scan ON files(scan_id);
CREATE INDEX IF NOT EXISTS idx_processes_scan ON processes(scan_id);
