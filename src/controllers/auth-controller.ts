import {
  Authorized,
  Body, CurrentUser, Get, JsonController, Post,
} from 'routing-controllers';
import dataSource from '../data-source';
import { User, UserRole } from '../entities/user';
import { AuthUser, Auth, AuthRole } from '../models/auth';
import { comparePassword, generateToken } from '../utils/auth-utils';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';
import { Customer, CustomerStatus } from '../entities/customer';

@JsonController('/auth')
export class AuthController {
  private em = dataSource.manager;

  @Get('/')
  @Authorized()
  getCurrentUser(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Post('/')
  async login(
    @Body({
      required: true,
      validate: { groups: ['login'] },
    })
    data: User,
  ): Promise<Auth> {
    const user = await this.em.findOneBy(User, { username: data.username });

    if (!user) {
      throw new AppError(ErrorName.USERNAME_NOTFOUND, { username: data.username });
    }

    if (!await comparePassword(data.password, user.password)) {
      throw new AppError(ErrorName.WRONG_PASSWORD);
    }

    let role = AuthRole.Any;

    if (user.role === UserRole.ADMIN) {
      role = AuthRole.Admin;
    } else if (user.role === UserRole.CUSTOMER) {
      const customer = await this.em.findOneByOrFail(Customer, { userId: user.id });

      if (customer.status === CustomerStatus.VERIFIED) {
        role = AuthRole.VerifiedCustomer;
      } else {
        role = AuthRole.Customer;
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role,
    };

    return { token: generateToken(authUser), user: authUser };
  }
}
