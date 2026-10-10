import crypto from 'node:crypto';
import { getDatabase } from '../database/db';

export interface CreateFeedbackInput {
  category: string;
  rating: number;
  feedbackText: string;
  pnr?: string;
  trainNumber?: string;
  stationCode?: string;
  passengerProfileId?: string;
}

export interface FeedbackRecord {
  id: string;
  category: string;
  rating: number;
  feedbackText: string;
  pnr?: string;
  trainNumber?: string;
  stationCode?: string;
  passengerProfileId?: string;
  createdAt: string;
}

export function submitFeedback(input: CreateFeedbackInput): FeedbackRecord {
  if (!input.category || typeof input.category !== 'string') {
    throw new Error('Feedback category is required.');
  }
  if (typeof input.rating !== 'number' || input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }
  if (!input.feedbackText || typeof input.feedbackText !== 'string' || input.feedbackText.trim().length === 0) {
    throw new Error('Feedback text is required.');
  }

  const id = `fb_${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO feedback (id, category, rating, feedback_text, pnr, train_number, station_code, passenger_profile_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.category.trim(),
    Math.round(input.rating),
    input.feedbackText.trim(),
    input.pnr?.trim() || null,
    input.trainNumber?.trim() || null,
    input.stationCode?.trim() || null,
    input.passengerProfileId?.trim() || null,
    createdAt
  );

  return {
    id,
    category: input.category.trim(),
    rating: Math.round(input.rating),
    feedbackText: input.feedbackText.trim(),
    pnr: input.pnr?.trim(),
    trainNumber: input.trainNumber?.trim(),
    stationCode: input.stationCode?.trim(),
    passengerProfileId: input.passengerProfileId?.trim(),
    createdAt
  };
}

export function getAllFeedback(): FeedbackRecord[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, category, rating, feedback_text, pnr, train_number, station_code, passenger_profile_id, created_at
    FROM feedback
    ORDER BY created_at DESC
  `).all() as any[];

  return rows.map(r => ({
    id: r.id,
    category: r.category,
    rating: r.rating,
    feedbackText: r.feedback_text,
    pnr: r.pnr || undefined,
    trainNumber: r.train_number || undefined,
    stationCode: r.station_code || undefined,
    passengerProfileId: r.passenger_profile_id || undefined,
    createdAt: r.created_at
  }));
}

export function getFeedbackById(id: string): FeedbackRecord | undefined {
  if (!id) return undefined;
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, category, rating, feedback_text, pnr, train_number, station_code, passenger_profile_id, created_at
    FROM feedback
    WHERE id = ?
  `).get(id) as any;

  if (!row) return undefined;
  return {
    id: row.id,
    category: row.category,
    rating: row.rating,
    feedbackText: row.feedback_text,
    pnr: row.pnr || undefined,
    trainNumber: row.train_number || undefined,
    stationCode: row.station_code || undefined,
    passengerProfileId: row.passenger_profile_id || undefined,
    createdAt: row.created_at
  };
}
