import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, UseBefore,
} from 'routing-controllers';
import type { SelectQueryBuilder } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { dataSource } from '../data-source';
import { Request } from '../entities/request';
import { Response, ResponseStatus } from '../entities/response';
import { User } from '../entities/user';
import {
  AlreadyExists, AppError, Forbidden, MoneyLimit,
} from '../error';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionAppResponse } from '../models/responses/collection-appresponse';
import type { RequestAppResponse } from '../models/responses/data';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { NewRequestParams, ResponseParams } from './params/request-params';

type RequestSelect = Request & { response?: Omit<Response, 'request'> };

@JsonController('/request')
@UseBefore(nameMiddleware('request'))
export class RequestController {
  private em = dataSource.manager;

  private selectQueryBuilder(verbose: boolean): SelectQueryBuilder<RequestSelect> {
    // HACK due to many bugs in typeorm, this is the best we can do
    // this will fetch all fields from joined relations
    const qb = this.em
      .createQueryBuilder(Request, 'request')
      .leftJoinAndMapOne(
        'request.response',
        Response,
        'response',
        'response.request_id = request.id',
      )
      .leftJoinAndMapOne(
        'response.responder',
        User,
        'responder',
        'responder.id = response.responder_id',
      );

    if (verbose) {
      qb
        .innerJoinAndSelect(
          'request.customer',
          'customer',
          'customer.user_id = request.customer_id',
        )
        .innerJoinAndSelect(
          'customer.user',
          'user',
          'user.id = customer.user_id',
        );
    }

    return qb as SelectQueryBuilder<RequestSelect>;
  }

  private static transformResult(result: RequestSelect, verbose: boolean): RequestAppResponse {
    const ref = result as unknown as RequestAppResponse;

    if (verbose) {
      ref.customer = {
        fullname: result.customer.fullname,
        balance: result.customer.balance,
        user: {
          username: result.customer.user.username,
        },
      };
    } else {
      delete ref.customer;
    }

    if (ref.response && result.response) {
      delete (ref.response as any).requestId;

      if (verbose) {
        ref.response.responder = {
          username: result.response.responder.username,
        };
      } else {
        delete ref.response.responder;
      }
    }

    return ref;
  }

  @Get('/')
  @Authorized([AuthRole.Admin, AuthRole.VerifiedCustomer])
  async getAll(

    @PaginationParams()
    { skip, take }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,
  ): Promise<CollectionAppResponse<RequestAppResponse>> {
    const isAdmin = user.role === AuthRole.Admin;
    const qb = this.selectQueryBuilder(isAdmin);

    if (!isAdmin) {
      qb.where('request.customerId = :customerId', { customerId: user.id });
    }

    qb.orderBy('request.created', 'DESC')
      .skip(skip)
      .take(take);

    const [requests, count] = await qb.getManyAndCount();

    return new CollectionAppResponse(
      requests.map((r) => RequestController.transformResult(r, isAdmin)),
      { skip, take, total: count },
    );
  }

  @Post('/')
  @Authorized(AuthRole.VerifiedCustomer)
  async create(

    @Body({ required: true, validate: true })
    data: NewRequestParams,

    @CurrentUser()
    user: AuthUser,

  ) {
    const amount = await convert(
      data.money.amount,
      data.money.currency,
      MoneyConfig.defaultCurrency.symbol,
    );

    if (amount < MoneyConfig.limit.request.min
      || amount > MoneyConfig.limit.request.max
    ) {
      throw new AppError(MoneyLimit({
        amount,
        limit: MoneyConfig.limit.request,
      }));
    }

    const request = this.em.create(Request, {
      customerId: user.id,
      amount,
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
    const request = await this
      .selectQueryBuilder(true)
      .where('request.id = :id', { id })
      .getOneOrFail();

    if (user.role !== AuthRole.Admin && request.customerId !== user.id) {
      throw new AppError(Forbidden());
    }

    return RequestController.transformResult(request, user.role === AuthRole.Admin);
  }

  @Post('/:id/response')
  @Authorized(AuthRole.Admin)
  async respond(

    @Param('id')
    id: number,

    @Body({
      required: true,
      validate: true,
    })
    { status }: ResponseParams,

    @CurrentUser()
    user: AuthUser,

  ) {
    let response: Response;

    await this.em.transaction(async (em) => {
      const request = await this.selectQueryBuilder(true)
        .where('request.id = :id', { id })
        .getOneOrFail();

      if (request.response) {
        throw new AppError(AlreadyExists({ thing: 'Response' }));
      }

      if (status === ResponseStatus.Accepted) {
        request.customer.balance += request.amount;
        await em.save(request.customer);
      }

      response = em.create(Response, {
        requestId: request.id,
        responderId: user.id,
        status,
      });

      await em.save(response);

      (response.responder as any) = {
        username: user.username,
      };
    });

    return response!;
  }
}
