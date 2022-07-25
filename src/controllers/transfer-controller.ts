import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, QueryParams, UseBefore,
} from 'routing-controllers';
import { FindOptionsSelect } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { dataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entities/customer';
import { Transfer } from '../entities/transfer';
import { ErrorName } from '../errors';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AuthRole, AuthUser } from '../models/auth';
import { AppError } from '../models/error';
import { CollectionResponse } from '../models/responses/collection-response';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { IssueTransferParams } from './params/transfer-params';

@JsonController('/transfer')
@UseBefore(nameMiddleware('Transaction'))
export class TransferController {
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
    query: Transfer,

    @PaginationParams()
    { page, pageSize }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,
  ): Promise<CollectionResponse<Transfer>> {
    const select: FindOptionsSelect<Transfer> = {
      sender: { userId: true, fullname: true, user: { username: true } },
      receiver: { userId: true, fullname: true, user: { username: true } },
    };

    let where: Transfer | Transfer[];

    if (user.role === AuthRole.VerifiedCustomer) {
      if (query.receiver != null && query.sender != null) {
        throw new AppError(ErrorName.Forbidden);
      }

      where = [];

      if (query.sender == null) {
        where.push({ ...query, senderId: user.id });
      }

      if (query.receiver == null) {
        where.push({ ...query, receiverId: user.id });
      }
    } else {
      where = { ...query };
    }

    const [transactions, count] = await this.em.findAndCount(Transfer, {
      select,
      where: where!,
      relations: { sender: { user: true }, receiver: { user: true } },
      order: { created: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return new CollectionResponse(transactions, {
      page,
      pageSize,
      totalItems: count,
    });
  }

  @Post('/')
  @Authorized(AuthRole.VerifiedCustomer)
  async transfer(

    @Body({ required: true, validate: true })
    data: IssueTransferParams,

    @CurrentUser()
    user: AuthUser,

  ) {
    if (data.username === user.username) {
      throw new AppError(ErrorName.InvalidInput);
    }

    let transfer: Transfer;

    await this.em.transaction(async (em) => {
      const sender = await em.findOneOrFail(Customer, {
        select: {
          userId: true, fullname: true, balance: true, user: { username: true },
        },
        relations: { user: true },
        where: { userId: user.id },
      });

      const amount = await convert(
        data.money.amount,
        data.money.currency,
        MoneyConfig.defaultCurrency,
      );

      if (sender.balance < amount) {
        throw new AppError(ErrorName.InvalidInput);
      }

      const receiver = await em.findOne(Customer, {
        select: { userId: true, fullname: true, user: { username: true } },
        relations: { user: true },
        where: { user: { username: data.username } },
      });

      if (!receiver) {
        throw new AppError(ErrorName.NotFound, 'Receiver');
      }

      if (receiver.status === CustomerStatus.Unverified) {
        throw new AppError(ErrorName.InvalidInput);
      }

      transfer = em.create(Transfer, {
        amount,
        receiverId: receiver.userId,
        senderId: sender.userId,
      });

      await em.save(transfer);
      await em.update(
        Customer,
        { userId: sender.userId },
        { balance: () => `balance - ${transfer.amount}` },
      );
      await em.update(
        Customer,
        { userId: receiver.userId },
        { balance: () => `balance - ${transfer.amount}` },
      );

      transfer.sender = sender;
      transfer.receiver = receiver;
    });

    return transfer!;
  }

  @Get('/:id')
  @Authorized()
  async getOne(
    @Param('id') id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const transfer = await this.em.findOneByOrFail(Transfer, { id });

    if (transfer.receiverId !== user.id && transfer.senderId !== user.id) {
      throw new AppError(ErrorName.Forbidden);
    }

    return transfer;
  }
}
