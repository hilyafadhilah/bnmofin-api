import { RequestSeeder } from './request-seeder';
import { UserSeeder } from './user-seeder';
import { TransferSeeder } from './transfer-seeder';
import { CustomerSeeder } from './customer-seeder';

export const seeders = [
  UserSeeder,
  CustomerSeeder,
  RequestSeeder,
  TransferSeeder,
];
