import { UserStore } from './auth/userStore';
import { SessionService } from './session/sessionManager';
import { SafeUser } from './types';
import { hashPassword, comparePassword } from './auth/passwordManager';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

export interface AuthServiceOptions {
  jwtSecret: string;
  jwtExpiresIn?: string;
  store: UserStore;
  sessions: SessionService;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly store: UserStore;
  private readonly sessions: SessionService;

  constructor(opts: AuthServiceOptions) {
    this.jwtSecret = opts.jwtSecret;
    this.jwtExpiresIn = opts.jwtExpiresIn ?? '8h';
    this.store = opts.store;
    this.sessions = opts.sessions;
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const passwordHash = await hashPassword(input.password);
    const user = await this.store.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    const token = this.createToken(user.id, user.email);
    await this.sessions.create(user.id, token);

    return {
      user: this.store.toSafe(user),
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.store.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    const token = this.createToken(user.id, user.email);
    await this.sessions.create(user.id, token);

    return {
      user: this.store.toSafe(user),
      token,
    };
  }

  async logout(token: string): Promise<void> {
    await this.sessions.revokeByToken(token);
  }

  async validateToken(token: string): Promise<AuthResult> {
    try {
      const decoded = this.verifyToken(token);
      const session = await this.sessions.findValid(decoded.sub, token);
      if (!session) {
        throw new Error('Session invalid');
      }
      const user = await this.store.findById(decoded.sub);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        user: this.store.toSafe(user),
        token,
      };
    } catch (err) {
      throw new Error('Unauthorized');
    }
  }

  private createToken(userId: string, email: string): string {
    const header = this.base64Url({ alg: 'HS256', typ: 'JWT' });
    const payload = this.base64Url({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseTTLSeconds(),
    });
    const signingInput = `${header}.${payload}`;
    const signature = this.signHS256(signingInput, this.jwtSecret);
    return `${signingInput}.${signature}`;
  }

  private verifyToken(token: string): { sub: string; email: string } {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) {
      throw new Error('Invalid token');
    }
    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSignature = this.signHS256(signingInput, this.jwtSecret);
    const providedBuffer = this.padBase64UrlToBytes(signature);
    const expectedBuffer = this.padBase64UrlToBytes(expectedSignature);
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(this.fromBase64Url(payloadB64)) as {
      sub: string;
      email: string;
      exp?: number;
    };
    if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired');
    }
    return payload;
  }

  private signHS256(input: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(input);
    return this.toBase64Url(hmac.digest('base64'));
  }

  private base64Url(obj: unknown): string {
    return this.toBase64Url(Buffer.from(JSON.stringify(obj)).toString('base64'));
  }

  private toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private fromBase64Url(value: string): string {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (padded.length % 4)) % 4;
    return Buffer.from(`${padded}${'='.repeat(padLength)}`, 'base64').toString('utf8');
  }

  private padBase64UrlToBytes(value: string): Buffer {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    return Buffer.from(`${base64}${'='.repeat(padLength)}`, 'base64');
  }

  private parseTTLSeconds(): number {
    const raw = this.jwtExpiresIn;
    if (typeof raw !== 'string') return 60 * 60 * 8;
    const m = raw.match(/^(\d+)([smhd])?$/);
    if (!m) return 60 * 60 * 8;
    const value = Number(m[1]);
    const unit = m[2] ?? 's';
    const map: Record<string, number> = { s: 1, m: 60, h: 60 * 60, d: 60 * 60 * 24 };
    return value * (map[unit] ?? 1);
  }
}