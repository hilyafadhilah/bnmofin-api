import {
  Authorized,
  Body, CurrentUser, Get, JsonController, Param, Post, Put, QueryParams, UploadedFile, UseBefore,
} from 'routing-controllers';
import { FindOptionsWhere } from 'typeorm';
import { isNotEmptyObject } from 'class-validator';
import { dataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entities/customer';
import { User } from '../entities/user';
import { hashPassword } from '../utils/auth-utils';
import { replaceFilename, uploadFile } from '../utils/fileupload-utils';
import { IdCardUploadConfig } from '../config/fileupload-config';
import { PaginationOptions } from './params/pagination-options';
import { PaginationParams } from './decorators/pagination-params';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionAppResponse } from '../models/responses/collection-appresponse';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AlreadyExists, AppError } from '../error';
import { CustomerQueryParams } from './params/customer-params';
import { makeStringWhere } from '../utils/db-utils';

const customerSelect = (isAdmin: boolean) => ({
  userId: true,
  fullname: true,
  idCardImage: isAdmin,
  balance: isAdmin,
  status: isAdmin,
  created: isAdmin,
  user: {
    username: true,
    created: isAdmin,
  },
});

@JsonController('/customer')
@UseBefore(nameMiddleware('customer'))
export class CustomerController {
  private em = dataSource.manager;

  @Post('/')
  @Authorized(AuthRole.None)
  async register(

    @Body({
      required: true,
      validate: { groups: ['register'] },
    })
    data: Customer,

    @UploadedFile('idCardImage', {
      required: true,
      options: IdCardUploadConfig.options,
    })
    file: Express.Multer.File,

  ): Promise<Customer> {
    let customer: Customer;

    await this.em.transaction(async (em) => {
      const existingUser = await em.findOneBy(User, { username: data.user.username });
      if (existingUser != null) {
        throw new AppError(AlreadyExists({ thing: `username ${data.user.username}` }));
      }

      let user: User = { ...data.user };
      user.password = await hashPassword(user.password);
      user = await em.save(User, user);

      const uploadedFile = await uploadFile(
        file.path,
        `${IdCardUploadConfig.dirname}/${replaceFilename(file.originalname, user.id.toString())}`,
      );

      customer = {
        ...data,
        user,
        userId: user.id,
        idCardImage: uploadedFile.name,
        balance: 0,
      };
      customer = await em.save(Customer, customer);
    });

    return customer!;
  }

  @Get('/')
  @Authorized(AuthRole.Admin)
  async getAll(

    @QueryParams({
      transform: {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      },
      validate: {
        skipMissingProperties: true,
      },
    })
    query: CustomerQueryParams,

    @PaginationParams()
    { skip, take }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,

  ): Promise<CollectionAppResponse<Customer>> {
    let where: FindOptionsWhere<Customer>[] | undefined;

    if (isNotEmptyObject(query)) {
      where = [
        { fullname: makeStringWhere(query.fullname) },
        { user: { username: makeStringWhere(query.username) } },
      ];
    }

    const [customers, count] = await this.em.findAndCount(Customer, {
      select: customerSelect(user.role === AuthRole.Admin),
      relations: { user: true },
      where,
      order: { created: 'desc' },
      skip,
      take,
    });

    return new CollectionAppResponse(customers, { skip, take, total: count });
  }

  @Get('/:username')
  @Authorized([AuthRole.VerifiedCustomer, AuthRole.Admin])
  async getOne(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.em.findOne(Customer, {
      select: customerSelect(user.role === AuthRole.Admin || user.username === username),
      relations: { user: true },
      where: { user: { username } },
    });
  }

  @Put('/:username/verify')
  @Authorized(AuthRole.Admin)
  async verify(@Param('username') username: string) {
    let customer: Customer;

    await this.em.transaction(async (em) => {
      customer = await em.findOneByOrFail(Customer, { user: { username } });
      customer.status = CustomerStatus.Verified;
      await em.save(customer);
    });

    return customer!;
  }
}
