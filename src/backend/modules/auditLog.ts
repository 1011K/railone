import crypto from 'node:crypto';
import { getDatabase } from '../database/db';

export interface AuditLogEntry {
  id: string;
  eventType: string;
  actor: string;
  entityType: string;
  entityId: string;
  payload?: any;
  ipAddress?: string;
  createdAt: string;
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
  const db = getDatabase();
  const id = 'AUDIT-' + crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const payloadJson = entry.payload ? JSON.stringify(entry.payload) : null;

  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, event_type, actor, entity_type, entity_id, payload_json, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    entry.eventType,
    entry.actor,
    entry.entityType,
    entry.entityId,
    payloadJson,
    entry.ipAddress || '127.0.0.1',
    createdAt
  );

  return {
    id,
    eventType: entry.eventType,
    actor: entry.actor,
    entityType: entry.entityType,
    entityId: entry.entityId,
    payload: entry.payload,
    ipAddress: entry.ipAddress,
    createdAt
  };
}

export function getAuditLogs(limit = 50, eventType?: string): AuditLogEntry[] {
  const db = getDatabase();
  let rows: any[];

  if (eventType) {
    const stmt = db.prepare('SELECT * FROM audit_logs WHERE event_type = ? ORDER BY created_at DESC LIMIT ?');
    rows = stmt.all(eventType, limit);
  } else {
    const stmt = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?');
    rows = stmt.all(limit);
  }

  return rows.map(r => ({
    id: r.id,
    eventType: r.event_type,
    actor: r.actor,
    entityType: r.entity_type,
    entityId: r.entity_id,
    payload: r.payload_json ? JSON.parse(r.payload_json) : null,
    ipAddress: r.ip_address,
    createdAt: r.created_at
  }));
}
