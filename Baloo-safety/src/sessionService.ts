import { UserStore } from './userStore';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  revoked: boolean;
}

export class SessionService {
  private sessions = new Map<string, Session>();

  async create(userId: string, token: string): Promise<void> {
    const session: Session = {
      id: uuidv4(),
      userId,
      token,
      createdAt: new Date(),
      revoked: false,
    };
    this.sessions.set(session.id, session);
  }

  async revokeByToken(token: string): Promise<void> {
    const session = Array.from(this.sessions.values()).find(s => s.token === token);
    if (session) {
      session.revoked = true;
    }
  }

  async findValid(userId: string, token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) return false;
    if (session.revoked) return false;
    if (session.userId !== userId) return false;
    return true;
  }

  async listAll(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
}