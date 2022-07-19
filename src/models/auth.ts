import { User } from '../entities/user';

export type AuthUser = Omit<User, 'password' | 'role'> & {
  role: AuthRole
};

export interface Auth {
  token: string,
  user: AuthUser
}

export enum AuthRole {
  None = -1,
  Any = 0,
  Customer = 1,
  VerifiedCustomer = 1.5,
  Admin = 2,
}
