import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, QueryParams, UseBefore,
} from 'routing-controllers';
import { FindOptionsSelect } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { dataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entities/customer';
import { Transfer } from '../entities/transfer';
import {
  AppError, Forbidden, InsufficientBalance, InvalidInput, MoneyLimit, NotFound,
} from '../error';
import { nameMiddleware } from '../middlewares/name-middleware';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionAppResponse } from '../models/responses/collection-appresponse';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { PostIntent, PostOptions } from './params/post-options';
import { IssueTransferParams } from './params/transfer-params';

@JsonController('/transfer')
@UseBefore(nameMiddleware('transaction'))
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
    { skip, take }: PaginationOptions,

    @CurrentUser()
    user: AuthUser,
  ): Promise<CollectionAppResponse<Transfer>> {
    const select: FindOptionsSelect<Transfer> = {
      sender: { userId: true, fullname: true, user: { username: true } },
      receiver: { userId: true, fullname: true, user: { username: true } },
    };

    let where: Transfer | Transfer[];

    if (user.role === AuthRole.VerifiedCustomer) {
      if (query.receiver != null && query.sender != null) {
        throw new AppError(Forbidden());
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
      skip,
      take,
    });

    return new CollectionAppResponse(transactions, {
      skip,
      take,
      total: count,
    });
  }

  @Post('/')
  @Authorized(AuthRole.VerifiedCustomer)
  async transfer(

    @Body({ required: true, validate: true })
    data: IssueTransferParams,

    @QueryParams({ validate: true })
    { intent }: PostOptions,

    @CurrentUser()
    user: AuthUser,

  ) {
    if (data.username === user.username) {
      throw new AppError(InvalidInput({ thing: 'Receiver' }));
    }

    let transfer: Transfer;

    await this.em.transaction(async (em) => {
      const sender = await em.findOneOrFail(Customer, {
        select: {
          userId: true,
          fullname: true,
          balance: true,
          user: { id: true, username: true },
        },
        relations: { user: true },
        where: { userId: user.id },
      });

      const receiver = await em.findOne(Customer, {
        select: {
          userId: true,
          fullname: true,
          balance: true,
          user: { id: true, username: true },
        },
        relations: { user: true },
        where: { user: { username: data.username } },
      });

      if (!receiver) {
        throw new AppError(NotFound({
          thing: 'Receiver',
          thingDetailed: `@${data.username}`,
        }));
      }

      if (receiver.status === CustomerStatus.Unverified) {
        throw new AppError(InvalidInput({
          thing: 'receiver',
          message: 'The submitted receiver has not yet been verified.',
        }));
      }

      const amount = await convert(
        data.money.amount,
        data.money.currency,
        MoneyConfig.defaultCurrency.symbol,
      );

      if (sender.balance < amount) {
        throw new AppError(InsufficientBalance({
          balance: sender.balance,
          amount: data.money.amount,
        }));
      }

      if (amount < MoneyConfig.limit.transfer.min
        || amount > MoneyConfig.limit.transfer.max
      ) {
        throw new AppError(MoneyLimit({
          amount,
          limit: MoneyConfig.limit.transfer,
        }));
      }

      transfer = em.create(Transfer, {
        amount,
        receiverId: receiver.userId,
        senderId: sender.userId,
      });

      if (intent !== PostIntent.Preload) {
        await em.save(transfer);
      }

      sender.balance -= transfer.amount;
      receiver.balance += transfer.amount;

      if (intent !== PostIntent.Preload) {
        await em.save(sender);
        await em.save(receiver);
      }

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
      throw new AppError(Forbidden());
    }

    return transfer;
  }
}
