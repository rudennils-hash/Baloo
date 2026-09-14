import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const SECRET_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SECRET_LENGTH);
  const derivedKey = (await scryptAsync(
    Buffer.from(password, 'utf8'),
    salt,
    64,
  )) as Buffer;
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) {
    throw new Error('Invalid stored password hash format');
  }
  const salt = Buffer.from(saltHex, 'hex');
  const derivedKey = (await scryptAsync(
    Buffer.from(password, 'utf8'),
    salt,
    64,
  )) as Buffer;
  return derivedKey.toString('hex') === hashHex;
}