import { User } from '../entities/user';

export type AuthUser = Omit<User, 'password' | 'role'> & {
  role: AuthRole
};

export interface Auth {
  token: string,
  user: AuthUser
}

export enum AuthRole {
  None = 'None',
  Any = 'Any',
  Customer = 'Customer',
  VerifiedCustomer = 'UnverifiedCustomer',
  Admin = 'Admin',
}
