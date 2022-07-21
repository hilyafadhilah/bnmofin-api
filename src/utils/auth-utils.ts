import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { instanceToPlain } from 'class-transformer';
import { AuthUser } from '../models/auth';

console.assert(process.env.TOKEN_KEY, 'Auth token is not set.');

const tokenKey = process.env.TOKEN_KEY!;

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
  const { id, username, role } = jwt.verify(token, tokenKey) as JwtPayload;
  console.log({ id, username, role });
  return { id, username, role };
};
