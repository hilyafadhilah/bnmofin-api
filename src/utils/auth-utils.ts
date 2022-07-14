import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { User } from '../entities/user';
import { AuthUser } from '../models/auth';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (input: string, hashed: string) => (
  bcrypt.compare(input, hashed)
);

export const generateToken = (user: User) => {
  const payload: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, process.env.TOKEN_KEY!, { expiresIn: '1h' });
};

export const decodeToken = (token: string) => {
  const decoded = jwt.verify(token, process.env.TOKEN_KEY!) as JwtPayload;
  return {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  } as AuthUser;
};
