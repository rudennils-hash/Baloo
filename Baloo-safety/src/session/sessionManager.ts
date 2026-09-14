import { randomBytes } from 'crypto';
import { SessionRecord } from '../types';

export interface SessionService {
  create(userId: string, token: string): Promise<void>;
  revokeByToken(token: string): Promise<void>;
  findValid(userId: string, token: string): Promise<boolean>;
}

export class InMemorySessionService implements SessionService {
  private sessions = new Map<string, SessionRecord>();

  async create(userId: string, token: string): Promise<void> {
    const now = new Date();
    const ttlMs = 2 * 60 * 60 * 1000; // 2 hours
    const session: SessionRecord = {
      id: randomBytes(16).toString('hex'),
      userId,
      token,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
      revoked: false,
    };
    this.sessions.set(token, session);
  }

  async revokeByToken(token: string): Promise<void> {
    const session = this.sessions.get(token);
    if (session) {
      session.revoked = true;
    }
  }

  async findValid(userId: string, token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) return false;
    if (session.revoked) return false;
    if (session.userId !== userId) return false;
    if (session.expiresAt.getTime() < Date.now()) return false;
    return true;
  }
}