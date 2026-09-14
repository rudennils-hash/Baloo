export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

export interface UserStore {
  create(input: Omit<User, 'id'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export class MemoryUserStore implements UserStore {
  private users = new Map<string, User>();
  private nextId = 1;

  async create(input: Omit<User, 'id'>): Promise<User> {
    const id = `user_${this.nextId++}`;
    const user: User = { ...input, id };
    this.users.set(id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }
}