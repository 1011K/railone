import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { getPassengerProfile, PassengerProfile } from '../modules/passengerProfiles';
import { getBookingById, BookingRecord } from '../modules/ticketing';

// Demo tokens can use an ephemeral process secret; production must fail closed.
if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
  throw new Error('Production AUTH_SECRET must contain at least 32 characters.');
}
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

export interface AuthenticatedRequest extends Request {
  authenticatedPassenger?: PassengerProfile;
  authenticatedPassengerId?: string;
}

/**
 * Generates a signed, tamper-evident auth token for a passenger.
 * Payload: <passengerId>.<timestamp>.<hmacSignature>
 */
export function issuePassengerToken(passengerId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${passengerId}.${timestamp}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Validates a passenger auth token and returns the passenger ID if authentic.
 */
export function verifyPassengerToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [passengerId, timestampStr, signature] = parts;
  if (!passengerId || !timestampStr || !signature) return null;

  const ts = Number(timestampStr);
  if (isNaN(ts) || ts <= 0) return null;
  const now = Date.now();
  // Reject future tokens (> 60s clock skew) and tokens older than 30 days
  if (ts > now + 60_000 || now - ts > 30 * 24 * 60 * 60 * 1000) {
    return null;
  }

  const payload = `${passengerId}.${timestampStr}`;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length) {
    return null;
  }
  if (crypto.timingSafeEqual(sigBuf, expBuf)) {
    return passengerId;
  }
  return null;
}

/**
 * Extracts and validates passenger identity from Authorization header or custom headers.
 */
export function authenticatePassenger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const tokenHeader = (req.headers['x-passenger-token'] as string) || (req.headers['x-auth-token'] as string);
  
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (tokenHeader) {
    token = tokenHeader.trim();
  }

  let passengerId: string | null = null;
  if (token) {
    passengerId = verifyPassengerToken(token);
  }

  if (!passengerId) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please provide a valid passenger authorization token in Authorization header.'
    });
    return;
  }

  const profile = getPassengerProfile(passengerId);
  if (!profile) {
    res.status(401).json({
      error: 'UNAUTHORIZED_PASSENGER_NOT_FOUND',
      message: `Passenger profile '${passengerId}' not found. Please log in or register a profile.`
    });
    return;
  }

  req.authenticatedPassenger = profile;
  req.authenticatedPassengerId = profile.id;
  next();
}

/**
 * Optional authentication: attaches passenger if token is provided, does not reject if absent.
 */
export function optionalPassengerAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const tokenHeader = (req.headers['x-passenger-token'] as string) || (req.headers['x-auth-token'] as string);
  
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (tokenHeader) {
    token = tokenHeader.trim();
  }

  let passengerId: string | null = null;
  if (token) {
    passengerId = verifyPassengerToken(token);
  }

  if (passengerId) {
    const profile = getPassengerProfile(passengerId);
    if (profile) {
      req.authenticatedPassenger = profile;
      req.authenticatedPassengerId = profile.id;
    }
  }
  next();
}

/**
 * Ensures authenticated passenger owns the booking or resource.
 */
export function verifyOwnership(req: AuthenticatedRequest, res: Response, ownerId?: string): boolean {
  if (!req.authenticatedPassengerId) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
    return false;
  }

  if (ownerId && req.authenticatedPassengerId !== ownerId) {
    res.status(403).json({
      error: 'FORBIDDEN_CROSS_USER_ACCESS',
      message: 'Cross-user data access denied: you do not have permission to view or modify this resource.'
    });
    return false;
  }

  return true;
}
