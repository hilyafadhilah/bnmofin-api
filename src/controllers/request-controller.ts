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
import { ErrorName } from '../errors';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AuthRole, AuthUser } from '../models/auth';
import { AppError } from '../models/error';
import { CollectionAppResponse } from '../models/responses/collection-appresponse';
import type { RequestAppResponse } from '../models/responses/data';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { NewRequestParams, ResponseParams } from './params/request-params';

type RequestSelect = Request & { response?: Omit<Response, 'request'> };

@JsonController('/request')
@UseBefore(nameMiddleware('Request'))
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

  private static transformResult(result: RequestSelect): RequestAppResponse {
    const ref = result as unknown as RequestAppResponse;

    ref.customer = {
      fullname: ref.customer.fullname,
      user: {
        username: ref.customer.user.username,
      },
    };

    if (ref.response) {
      delete (ref.response as any).requestId;
      ref.response.responder = {
        username: ref.response.responder.username,
      };
    }

    return ref;
  }

  @Get('/')
  @Authorized([AuthRole.Admin, AuthRole.VerifiedCustomer])
  async getAll(

    @PaginationParams()
    { page, pageSize }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,
  ): Promise<CollectionAppResponse<RequestAppResponse>> {
    const isAdmin = user.role === AuthRole.Admin;
    const qb = this.selectQueryBuilder(isAdmin);

    if (!isAdmin) {
      qb.where('request.customerId = :customerId', { customerId: user.id });
    }

    qb.orderBy('request.created', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [requests, count] = await qb.getManyAndCount();
    requests.forEach(RequestController.transformResult);

    return new CollectionAppResponse(
      requests as unknown as RequestAppResponse[],
      {
        page,
        pageSize,
        totalItems: count,
      },
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
    const request = await this
      .selectQueryBuilder(true)
      .where('request.id = :id', { id })
      .getOneOrFail();

    if (user.role !== AuthRole.Admin && request.customerId !== user.id) {
      throw new AppError(ErrorName.Forbidden);
    }

    return RequestController.transformResult(request);
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
      const request = await this.em.findOneByOrFail(Request, { id });
      const found = await this.em.countBy(Response, { requestId: id });

      if (found !== 0) {
        throw new AppError(ErrorName.AlreadyExists, 'Response');
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

      await em.save(request);
    });

    return response!;
  }
}
