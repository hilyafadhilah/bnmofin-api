/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { CustomerFactory } from '../factories/customer-factory';
import { UserFactory } from '../factories/user-factory';

export class UserSeeder extends Seeder {
  async run() {
    await Promise.all([
      new UserFactory().createMany(15),
      new CustomerFactory().createMany(200, { balance: 0 }),
    ]);
    return undefined;
  }
}
