import { Customer } from '../../../entities/customer';
import { AuthUser } from '../../auth';

export interface CurrentUserResponse {
  user: AuthUser;
  customer?: Omit<Customer, 'user'>;
}

export interface LoginResponse extends CurrentUserResponse {
  token: string;
}
