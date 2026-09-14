export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
}