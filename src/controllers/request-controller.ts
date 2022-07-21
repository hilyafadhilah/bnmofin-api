import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, Put, QueryParams,
} from 'routing-controllers';
import { FindManyOptions } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import dataSource from '../data-source';
import { Customer } from '../entities/customer';
import { Request, RequestStatus } from '../entities/request';
import { ErrorName } from '../errors';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionResponse } from '../models/collection-response';
import { AppError } from '../models/error';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { NewRequestParams } from './params/request-params';

@JsonController('/request')
export class RequestController {
  private em = dataSource.manager;

  @Get('/')
  @Authorized([AuthRole.Admin, AuthRole.VerifiedCustomer])
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
    query: Request,

    @PaginationParams()
    { page, pageSize }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,
  ): Promise<CollectionResponse<Request>> {
    if (user.role === AuthRole.VerifiedCustomer
      && (query.customer != null)
    ) {
      throw new AppError(ErrorName.Forbidden);
    }

    const options: FindManyOptions<Request> = {
      skip: (page - 1) * pageSize,
      take: pageSize,
    };

    if (user.role === AuthRole.Admin) {
      options.select = {
        customer: { fullname: true },
      };
      options.where = query;
      options.relations = { customer: true };
    } else if (user.role === AuthRole.VerifiedCustomer) {
      options.where = {
        ...query,
        customerId: user.id,
      };
    }

    const [requests, count] = await this.em.findAndCount(Request, options);

    return {
      meta: {
        page,
        pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
      },
      data: requests,
    };
  }

  @Post('/')
  @Authorized(AuthRole.VerifiedCustomer)
  async create(

    @Body({ required: true, validate: true })
    data: NewRequestParams,

    @CurrentUser()
    user: AuthUser,

  ) {
    const request = this.em.create(Request, {
      customerId: user.id,
      amount: await convert(
        data.money.amount,
        data.money.currency,
        MoneyConfig.defaultCurrency,
      ),
    });

    await this.em.save(request);
    return request;
  }

  @Get('/:id')
  @Authorized()
  async getOne(
    @Param('id') id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const request = await this.em.findOneBy(Request, { id });
    if (!request) {
      throw new AppError(ErrorName.NotFound, 'Request');
    }

    if (request.customerId !== user.id) {
      throw new AppError(ErrorName.Forbidden);
    }

    return request;
  }

  @Put('/:id/status')
  @Authorized(AuthRole.Admin)
  async updateStatus(

    @Param('id')
    id: number,

    @Body({
      required: true,
      validate: { groups: ['updateStatus'] },
    })
    { status }: Request,

  ) {
    let request: Request;

    await this.em.transaction(async (em) => {
      const find = await em.findOne(Request, { where: { id } });

      if (!find) {
        throw new AppError(ErrorName.NotFound, 'Request');
      }

      request = find;

      if (request.status !== RequestStatus.Awaiting) {
        throw new AppError(ErrorName.InvalidInput);
      }

      if (status === RequestStatus.Accepted) {
        await em.update(
          Customer,
          { userId: request.customerId },
          { balance: () => `balance + ${request.amount}` },
        );
        // request.customer.balance += request.amount;
      }

      request.status = status;
      await em.save(request);

      // Reload customer. See https://github.com/typeorm/typeorm/issues/3255
      request.customer = await em.findOneByOrFail(Customer, { userId: request.customerId });
    });

    return request!;
  }
}
