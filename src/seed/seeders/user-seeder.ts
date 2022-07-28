/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { UserFactory } from '../factories/user-factory';

export class UserSeeder extends Seeder {
  async run() {
    await new UserFactory().createMany(15);
  }
}
