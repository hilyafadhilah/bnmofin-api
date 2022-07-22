import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, Put, QueryParams, UseBefore,
} from 'routing-controllers';
import { FindManyOptions } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { dataSource } from '../data-source';
import { Customer } from '../entities/customer';
import { Request, RequestStatus } from '../entities/request';
import { ErrorName } from '../errors';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AuthRole, AuthUser } from '../models/auth';
import { AppError } from '../models/error';
import { CollectionResponse } from '../models/responses/collection-response';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { NewRequestParams } from './params/request-params';

@JsonController('/request')
@UseBefore(nameMiddleware('Request'))
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

    return new CollectionResponse(requests, {
      page,
      pageSize,
      totalItems: count,
    });
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
  @Authorized([AuthRole.VerifiedCustomer, AuthRole.Admin])
  async getOne(
    @Param('id') id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const request = await this.em.findOneByOrFail(Request, { id });

    if (user.role !== AuthRole.Admin && request.customerId !== user.id) {
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
      const find = await em.findOneOrFail(Request, { where: { id } });

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

      try {
        // Reload customer. See https://github.com/typeorm/typeorm/issues/3255
        request.customer = await em.findOneByOrFail(Customer, { userId: request.customerId });
      } catch (err) {
        throw new AppError(ErrorName.ServerError, err);
      }
    });

    return request!;
  }
}
