import {
  Authorized, Body, CurrentUser, Get, JsonController, Param, Post, QueryParams,
} from 'routing-controllers';
import { FindOptionsSelect } from 'typeorm';
import { convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { dataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entities/customer';
import { Transfer } from '../entities/transfer';
import { ErrorName } from '../errors';
import { AuthRole, AuthUser } from '../models/auth';
import { CollectionResponse } from '../models/collection-response';
import { AppError } from '../models/error';
import { PaginationParams } from './decorators/pagination-params';
import { PaginationOptions } from './params/pagination-options';
import { IssueTransferParams } from './params/transfer-params';

@JsonController('/transfer')
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
    let select: FindOptionsSelect<Transfer> = {};

    if (user.role === AuthRole.Admin) {
      select = {
        sender: { userId: true, fullname: true, balance: true },
        receiver: { userId: true, fullname: true, balance: true },
      };
    } else {
      select = {
        sender: { userId: true, fullname: true },
        receiver: { userId: true, fullname: true },
      };
    }

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
      relations: { sender: true, receiver: true },
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
      data: transactions,
    };
  }

  @Post('/')
  @Authorized(AuthRole.VerifiedCustomer)
  async transfer(

    @Body({ required: true })
    data: IssueTransferParams,

    @CurrentUser()
    user: AuthUser,

  ) {
    if (data.receiverId === user.id) {
      throw new AppError(ErrorName.InvalidInput);
    }

    let transfer: Transfer;

    await this.em.transaction(async (em) => {
      const sender = await em.findOneByOrFail(Customer, { userId: user.id });
      const amount = await convert(
        data.money.amount,
        data.money.currency,
        MoneyConfig.defaultCurrency,
      );

      if (sender.balance < amount) {
        throw new AppError(ErrorName.InvalidInput);
      }

      const receiver = await em.findOneBy(Customer, { userId: data.receiverId });

      if (!receiver) {
        throw new AppError(ErrorName.NotFound, 'Receiver');
      }

      if (receiver.status === CustomerStatus.Unverified) {
        throw new AppError(ErrorName.InvalidInput);
      }

      transfer = em.create(Transfer, {
        amount,
        receiverId: data.receiverId,
        senderId: user.id,
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
    });

    return transfer!;
  }

  @Get('/:id')
  @Authorized()
  async getOne(
    @Param('id') id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const transfer = await this.em.findOneBy(Transfer, { id });

    if (!transfer) {
      throw new AppError(ErrorName.NotFound, 'Transaction');
    }

    if (transfer.receiverId !== user.id && transfer.senderId !== user.id) {
      throw new AppError(ErrorName.Forbidden);
    }

    return transfer;
  }
}
