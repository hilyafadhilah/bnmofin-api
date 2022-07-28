import {
  Authorized,
  Body, CurrentUser, Get, JsonController, Post,
} from 'routing-controllers';
import { dataSource } from '../data-source';
import { User, UserRole } from '../entities/user';
import { AuthUser, AuthRole } from '../models/auth';
import { comparePassword, generateToken } from '../utils/auth-utils';
import { Customer, CustomerStatus } from '../entities/customer';
import { CurrentUserAppResponse, LoginAppResponse } from '../models/responses/data/auth-appresponse';
import {
  AppError, Forbidden, InvalidCredentials, NotFound, Unauthorized,
} from '../error';

@JsonController('/auth')
export class AuthController {
  private em = dataSource.manager;

  @Get('/')
  @Authorized()
  async getCurrentUser(@CurrentUser() user: AuthUser): Promise<CurrentUserAppResponse> {
    const result: CurrentUserAppResponse = { user };

    if (user.role === AuthRole.Customer || user.role === AuthRole.VerifiedCustomer) {
      result.customer = await this.em.findOneByOrFail(Customer, { userId: user.id });
    }

    return result;
  }

  @Post('/')
  async login(
    @Body({
      required: true,
      validate: { groups: ['login'] },
    })
    data: User,
  ): Promise<LoginAppResponse> {
    const user = await this.em.findOneBy(User, { username: data.username });

    if (!user) {
      throw new AppError(NotFound({ thing: `username "${data.username}"` }));
    }

    if (!await comparePassword(data.password, user.password)) {
      throw new AppError(InvalidCredentials({ message: 'Wrong password.' }));
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
        throw new AppError(Forbidden({ message: 'Account not verified.' }));
      }
    } else {
      throw new AppError(Unauthorized());
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
