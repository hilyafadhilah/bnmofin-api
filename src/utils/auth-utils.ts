import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { instanceToPlain } from 'class-transformer';
import { AuthUser } from '../models/auth';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (input: string, hashed: string) => (
  bcrypt.compare(input, hashed)
);

export const generateToken = (payload: AuthUser) => (
  jwt.sign(instanceToPlain(payload), process.env.TOKEN_KEY!, { expiresIn: '1h' })
);

export const decodeToken = (token: string): AuthUser => {
  const { id, username, role } = jwt.verify(token, process.env.TOKEN_KEY!) as JwtPayload;
  console.log({ id, username, role });
  return { id, username, role };
};
