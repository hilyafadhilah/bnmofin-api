import { DataSource } from 'typeorm';
import { entities } from './entities';
import { seeder } from './seed';
import { isTrueString } from './utils/data-utils';

console.assert(process.env.DATABASE_URL, 'Database URL is not set.');

const isSsl = isTrueString(process.env.DATABASE_SSL);

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  dropSchema: seeder.isSeed,
  synchronize: false,
  logging: ['info', 'warn', 'error', 'migration'],
  entities,
  subscribers: [],
  migrations: [],
});
