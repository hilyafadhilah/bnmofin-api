import {
  Body, CurrentUser, Get, JsonController, Post,
} from 'routing-controllers';
import dataSource from '../data-source';
import { User } from '../entities/user';
import type { AuthUser, Auth } from '../models/auth';
import { comparePassword, generateToken } from '../utils/auth-utils';

@JsonController('/auth')
export class AuthController {
  private em = dataSource.manager;

  @Get('/')
  getCurrentUser(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Post('/')
  async login(@Body({ required: true, validate: { groups: ['login'] } }) data: User): Promise<Auth> {
    const user = await this.em.findOneBy(User, { username: data.username });

    if (!user) {
      throw new Error('404');
    }

    if (!await comparePassword(data.password, user.password)) {
      throw new Error('501');
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    return { token: generateToken(user), user: authUser };
  }
}
