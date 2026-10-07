import crypto from 'node:crypto';
import { getDatabase } from '../database/db';

export interface NotificationRecord {
  id: string;
  passengerProfileId?: string;
  title: string;
  body: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  readFlag: boolean;
  createdAt: string;
}

export function sendNotification(data: {
  passengerProfileId?: string;
  title: string;
  body: string;
  severity?: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
}): NotificationRecord {
  const db = getDatabase();
  const id = 'NOTIF-' + crypto.randomUUID();
  const now = new Date().toISOString();
  const severity = data.severity || 'INFO';

  const stmt = db.prepare(`
    INSERT INTO notifications (id, passenger_profile_id, title, body, severity, read_flag, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `);

  stmt.run(id, data.passengerProfileId || null, data.title, data.body, severity, now);

  return {
    id,
    passengerProfileId: data.passengerProfileId,
    title: data.title,
    body: data.body,
    severity,
    readFlag: false,
    createdAt: now
  };
}

export function getNotifications(passengerProfileId?: string, limit = 20): NotificationRecord[] {
  const db = getDatabase();
  let rows: any[];

  if (passengerProfileId) {
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE passenger_profile_id = ? OR passenger_profile_id IS NULL
      ORDER BY created_at DESC LIMIT ?
    `);
    rows = stmt.all(passengerProfileId, limit);
  } else {
    const stmt = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?');
    rows = stmt.all(limit);
  }

  return rows.map(r => ({
    id: r.id,
    passengerProfileId: r.passenger_profile_id,
    title: r.title,
    body: r.body,
    severity: r.severity,
    readFlag: r.read_flag === 1,
    createdAt: r.created_at
  }));
}
