import {
  Authorized,
  Body, CurrentUser, Get, JsonController, Param, Post, Put, QueryParams, UploadedFile,
} from 'routing-controllers';
import dataSource from '../data-source';
import { Customer, CustomerStatus } from '../entities/customer';
import { User } from '../entities/user';
import { hashPassword } from '../utils/auth-utils';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';
import { replaceFilename, uploadFile } from '../utils/fileupload-utils';
import { IdCardUploadConfig } from '../config/fileupload-config';
import { PaginationOptions } from './params/pagination-options';
import { PaginationParams } from './decorators/pagination-params';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionResponse } from '../models/collection-response';

const customerSelect = (isAdmin: boolean) => ({
  userId: true,
  fullname: true,
  idCardImage: isAdmin,
  balance: isAdmin,
  status: isAdmin,
  user: {
    username: true,
  },
});

@JsonController('/customer')
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
        throw new AppError(ErrorName.UsernameTaken, { username: data.user.username });
      }

      let user: User = { ...data.user };
      user.password = await hashPassword(user.password);
      user = await em.save(User, user);

      const uploadedFile = await uploadFile(
        file.path,
        `IdCards/${replaceFilename(file.originalname, user.id.toString())}`,
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
  @Authorized([AuthRole.VerifiedCustomer, AuthRole.Admin])
  async getAll(

    @QueryParams({
      transform: {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      },
      validate: {
        groups: ['query'],
        skipMissingProperties: true,
      },
    })
    query: Customer,

    @PaginationParams()
    { page, pageSize }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,

  ): Promise<CollectionResponse<Customer>> {
    if (user.role === AuthRole.VerifiedCustomer
      && (query.balance !== undefined || query.status !== undefined)
    ) {
      throw new AppError(ErrorName.Forbidden);
    }

    const [customers, count] = await this.em.findAndCount(Customer, {
      select: customerSelect(user.role === AuthRole.Admin),
      relations: { user: true },
      where: query,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      meta: {
        page,
        pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
      },
      data: customers,
    };
  }

  @Get('/:id')
  @Authorized([AuthRole.VerifiedCustomer, AuthRole.Admin])
  async getOne(
    @Param('id') id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const customer = await this.em.findOne(Customer, {
      select: customerSelect(user.role === AuthRole.Admin),
      relations: { user: true },
      where: { userId: id },
    });

    if (!customer) {
      throw new AppError(ErrorName.NotFound, 'Customer');
    }

    return customer;
  }

  @Put('/:id/verify')
  @Authorized(AuthRole.Admin)
  async verify(@Param('id') id: number) {
    let customer: Customer;

    await this.em.transaction(async (em) => {
      const find = await em.findOneBy(Customer, { userId: id });
      if (!find) {
        throw new AppError(ErrorName.NotFound, 'Customer');
      }

      customer = find;
      customer.status = CustomerStatus.Verified;
      await em.save(customer);
    });

    return customer!;
  }
}
