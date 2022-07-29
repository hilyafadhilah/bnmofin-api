import { faker } from '@faker-js/faker';
import {
  Constructable, FactorizedAttrs, Factory, InstanceAttribute, Subfactory,
} from '@jorgebodega/typeorm-seeding';
import { MoneyConfig } from '../../config/money-config';
import { Transfer } from '../../entities/transfer';
import { CustomerFactory } from './customer-factory';

export class TransferFactory extends Factory<Transfer> {
  protected entity: Constructable<Transfer> = Transfer;

  protected attrs(): FactorizedAttrs<Transfer> {
    return {
      sender: new Subfactory(CustomerFactory),
      receiver: new Subfactory(CustomerFactory),
      amount: parseFloat(faker.finance.amount(
        MoneyConfig.limit.transfer.min,
        MoneyConfig.limit.transfer.max,
        6,
      )),
      created: new InstanceAttribute(({ sender, receiver }) => (
        sender.created < receiver.created
          ? faker.date.between(receiver.created, new Date())
          : faker.date.between(sender.created, new Date())
      )),
    };
  }
}
