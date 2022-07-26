import { Customer } from '../../../entities/customer';
import { AuthUser } from '../../auth';

export interface CurrentUserAppResponse {
  user: AuthUser;
  customer?: Omit<Customer, 'user'>;
}

export interface LoginAppResponse extends CurrentUserAppResponse {
  token: string;
}
