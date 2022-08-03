/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { faker } from '@faker-js/faker';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { DataSource } from 'typeorm';
import { MoneyConfig } from '../../config/money-config';
import { Customer, CustomerStatus } from '../../entities/customer';
import { TransferFactory } from '../factories/transfer-factory';

export class TransferSeeder extends Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const customers = await dataSource.manager.find(Customer, {
      where: { status: CustomerStatus.Verified },
    });

    // this can be done in a few finite iterations

    const transferFactory = new TransferFactory();
    const moneyfulCustomers = customers.filter((c) => c.balance > 0);

    for (const customer of moneyfulCustomers) {
      for (let i = 0; i < faker.datatype.number(50); i++) {
        if (customer.balance <= 0) {
          break;
        }

        try {
          await dataSource.manager.transaction(async (em) => {
            const transfer = await transferFactory.make({
              sender: customer,
              receiver: faker.helpers.arrayElement(customers),
              amount: parseFloat(faker.finance.amount(
                MoneyConfig.limit.transfer.min,
                Math.min(customer.balance, MoneyConfig.limit.transfer.max),
                6,
              )),
            });

            transfer.sender.balance -= transfer.amount;
            transfer.receiver.balance += transfer.amount;

            await em.save(transfer);
            await em.save(transfer.sender);
            await em.save(transfer.receiver);
          });
        } catch {
          // Few transactions may fail, and its ok.
        }
      }
    }
  }
}
