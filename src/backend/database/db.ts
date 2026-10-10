import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export interface DatabaseConfig {
  dbPath?: string;
  inMemory?: boolean;
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(config?: DatabaseConfig): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const inMemory = config?.inMemory ?? (process.env.NODE_ENV === 'test' && !config?.dbPath);
  if (inMemory) {
    dbInstance = new DatabaseSync(':memory:');
  } else {
    const defaultPath = path.resolve(process.cwd(), 'railone.sqlite');
    const finalPath = config?.dbPath || process.env.DATABASE_PATH || defaultPath;
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    dbInstance = new DatabaseSync(finalPath);
  }

  initSchema(dbInstance);
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
}

export function resetDatabase(inMemory = true): DatabaseSync {
  closeDatabase();
  return getDatabase({ inMemory });
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS passenger_profiles (
      id TEXT PRIMARY KEY,
      phone TEXT,
      name TEXT NOT NULL,
      email TEXT,
      preferred_language TEXT DEFAULT 'en',
      has_season_pass INTEGER DEFAULT 0,
      season_pass_details TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE,
      passenger_profile_id TEXT,
      pnr TEXT NOT NULL,
      booking_timestamp TEXT NOT NULL,
      journey_date TEXT NOT NULL,
      service_type TEXT NOT NULL,
      train_number TEXT NOT NULL,
      train_name TEXT NOT NULL,
      from_station_code TEXT NOT NULL,
      from_station_name TEXT NOT NULL,
      to_station_code TEXT NOT NULL,
      to_station_name TEXT NOT NULL,
      class_booked TEXT NOT NULL,
      quota TEXT DEFAULT 'GN',
      fare_paid REAL NOT NULL,
      passengers_json TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      booking_state TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      qr_payload TEXT NOT NULL,
      is_simulated INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (passenger_profile_id) REFERENCES passenger_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      ticket_number TEXT UNIQUE NOT NULL,
      issued_at TEXT NOT NULL,
      status TEXT NOT NULL,
      qr_payload TEXT NOT NULL,
      is_simulated INTEGER DEFAULT 1,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS cancellations (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      cancelled_at TEXT NOT NULL,
      reason TEXT,
      fare_paid REAL NOT NULL,
      cash_refund REAL NOT NULL,
      wallet_refund REAL NOT NULL,
      voucher_credit REAL NOT NULL,
      clerical_deduction REAL NOT NULL,
      refund_status TEXT NOT NULL,
      refund_timeline TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS voice_sessions (
      session_id TEXT PRIMARY KEY,
      language TEXT NOT NULL DEFAULT 'en',
      turns_json TEXT NOT NULL,
      active_draft_json TEXT,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      passenger_profile_id TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      severity TEXT DEFAULT 'INFO',
      read_flag INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (passenger_profile_id) REFERENCES passenger_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload_json TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      rating INTEGER NOT NULL,
      feedback_text TEXT NOT NULL,
      pnr TEXT,
      train_number TEXT,
      station_code TEXT,
      passenger_profile_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr);
    CREATE INDEX IF NOT EXISTS idx_bookings_profile ON bookings(passenger_profile_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_idempotency ON bookings(idempotency_key);
    CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
  `);
}
