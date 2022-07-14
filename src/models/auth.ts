import { User } from '../entities/user';

export type AuthUser = Omit<User, 'password'>;
export interface Auth {
  token: string,
  user: AuthUser
}
