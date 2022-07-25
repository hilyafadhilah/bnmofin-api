import {
  Authorized,
  Body, CurrentUser, Get, JsonController, Post,
} from 'routing-controllers';
import { dataSource } from '../data-source';
import { User, UserRole } from '../entities/user';
import { AuthUser, AuthRole } from '../models/auth';
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
  ) {
    const user = await this.em.findOneBy(User, { username: data.username });

    if (!user) {
      throw new AppError(ErrorName.NotFound, `Username "${data.username}"`);
    }

    if (!await comparePassword(data.password, user.password)) {
      throw new AppError(ErrorName.WrongPassword);
    }

    let role = AuthRole.Any;
    let customer: Customer | undefined;

    if (user.role === UserRole.Admin) {
      role = AuthRole.Admin;
    } else if (user.role === UserRole.Customer) {
      customer = await this.em.findOneByOrFail(Customer, { userId: user.id });

      if (customer.status === CustomerStatus.Verified) {
        role = AuthRole.VerifiedCustomer;
      } else {
        throw new AppError(ErrorName.UnverifiedAccount);
      }
    } else {
      throw new AppError(ErrorName.Unauthorized);
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role,
      created: user.created,
    };

    return {
      token: generateToken(authUser),
      user: authUser,
      customer,
    };
  }
}
