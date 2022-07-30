import { DataSource } from 'typeorm';
import { entities } from './entities';
import { User } from './entities/user';
import { isTrueString } from './utils/data-utils';

console.assert(process.env.DATABASE_URL, 'Database URL is not set.');

const isSsl = isTrueString(process.env.DATABASE_SSL);

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ['info', 'warn', 'error', 'migration'],
  entities,
  subscribers: [],
  migrations: [],
});

export async function initializeDataSource() {
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();

  const testName = dataSource.getMetadata(User).tableName;
  const test = await queryRunner.getTable(testName);

  if (test === undefined) {
    await dataSource.synchronize();
  }
}
