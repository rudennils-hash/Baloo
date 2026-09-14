import { UserRecord, SafeUser } from '../types';

export interface UserStore {
  create(input: Omit<UserRecord, 'id'>): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  toSafe(user: UserRecord): SafeUser;
}

export class InMemoryUserStore implements UserStore {
  private users = new Map<string, UserRecord>();
  private emails = new Map<string, string>();

  async create(input: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const user: UserRecord = { ...input, id };
    this.users.set(id, user);
    this.emails.set(input.email.toLowerCase(), id);
    return user;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const id = this.emails.get(email.toLowerCase());
    if (!id) return null;
    return this.findById(id);
  }

  toSafe(user: UserRecord): SafeUser {
    const { passwordHash, ...safe } = user;
    return safe as SafeUser;
  }
}