import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { instanceToPlain } from 'class-transformer';
import { AuthUser } from '../models/auth';

console.assert(process.env.JWT_KEY, 'JWT key is not set.');

const tokenKey = process.env.JWT_KEY!;

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (input: string, hashed: string) => (
  bcrypt.compare(input, hashed)
);

export const generateToken = (payload: AuthUser) => (
  jwt.sign(instanceToPlain(payload), tokenKey, { expiresIn: '1h' })
);

export const decodeToken = (token: string): AuthUser => {
  const {
    id, username, role, created,
  } = jwt.verify(token, tokenKey) as JwtPayload;

  return {
    id, username, role, created,
  };
};
