import crypto from 'node:crypto';
import { getDatabase } from '../database/db';
import { logAuditEvent } from './auditLog';

export interface PassengerProfile {
  id: string;
  phone?: string;
  name: string;
  email?: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  hasSeasonPass: boolean;
  seasonPassDetails?: {
    passNumber: string;
    classType: string;
    validFrom: string;
    validTo: string;
    sourceCode: string;
    destCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function createPassengerProfile(data: {
  phone?: string;
  name: string;
  email?: string;
  preferredLanguage?: 'en' | 'hi' | 'mr';
  hasSeasonPass?: boolean;
  seasonPassDetails?: any;
}): PassengerProfile {
  const db = getDatabase();
  const id = 'USER-' + crypto.randomUUID().slice(0, 8);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO passenger_profiles (
      id, phone, name, email, preferred_language, has_season_pass, season_pass_details, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.phone || null,
    data.name,
    data.email || null,
    data.preferredLanguage || 'en',
    data.hasSeasonPass ? 1 : 0,
    data.seasonPassDetails ? JSON.stringify(data.seasonPassDetails) : null,
    now,
    now
  );

  logAuditEvent({
    eventType: 'PROFILE_CREATED',
    actor: id,
    entityType: 'PASSENGER_PROFILE',
    entityId: id,
    payload: { name: data.name, phone: data.phone }
  });

  return {
    id,
    phone: data.phone,
    name: data.name,
    email: data.email,
    preferredLanguage: data.preferredLanguage || 'en',
    hasSeasonPass: !!data.hasSeasonPass,
    seasonPassDetails: data.seasonPassDetails,
    createdAt: now,
    updatedAt: now
  };
}

export function getPassengerProfile(id: string): PassengerProfile | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM passenger_profiles WHERE id = ?');
  const row: any = stmt.get(id);

  if (!row) return null;

  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    preferredLanguage: row.preferred_language,
    hasSeasonPass: row.has_season_pass === 1,
    seasonPassDetails: row.season_pass_details ? JSON.parse(row.season_pass_details) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updatePassengerProfile(id: string, updates: Partial<PassengerProfile>): PassengerProfile | null {
  const db = getDatabase();
  const existing = getPassengerProfile(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = { ...existing, ...updates, updatedAt: now };

  const stmt = db.prepare(`
    UPDATE passenger_profiles SET
      phone = ?,
      name = ?,
      email = ?,
      preferred_language = ?,
      has_season_pass = ?,
      season_pass_details = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.phone || null,
    updated.name,
    updated.email || null,
    updated.preferredLanguage,
    updated.hasSeasonPass ? 1 : 0,
    updated.seasonPassDetails ? JSON.stringify(updated.seasonPassDetails) : null,
    now,
    id
  );

  logAuditEvent({
    eventType: 'PROFILE_UPDATED',
    actor: id,
    entityType: 'PASSENGER_PROFILE',
    entityId: id,
    payload: updates
  });

  return updated;
}
