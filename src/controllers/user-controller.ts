import {
  Body, JsonController, Post, UploadedFile,
} from 'routing-controllers';
import dataSource from '../data-source';
import { Customer } from '../entities/customer';
import { User } from '../entities/user';
import { hashPassword } from '../utils/auth-utils';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';

@JsonController('/user')
export class UserController {
  private em = dataSource.manager;

  @Post('/')
  async register(
  @Body({ required: true, validate: { groups: ['register'] } }) data: Customer,
    @UploadedFile('idCardImage', { required: true }) file: Express.Multer.File,
  ) {
    let customer: Customer;

    await this.em.transaction(async (em) => {
      const dbUser = await em.findOneBy(User, { username: data.user.username });
      if (dbUser != null) {
        throw new AppError(ErrorName.USERNAME_TAKEN, { username: data.user.username });
      }

      let user: User = { ...data.user };
      user.password = await hashPassword(user.password);
      user = await em.save(User, user);

      customer = {
        ...data,
        user,
        id: user.id,
        idCardImage: file.originalname,
        balance: 0,
      };
      customer = await em.save(Customer, customer);
    });

    return customer!;
  }
}
