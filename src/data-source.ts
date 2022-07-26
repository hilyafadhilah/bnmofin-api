import { DataSource } from 'typeorm';
import { entities } from './entities';
import { seeder } from './seed';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  dropSchema: seeder.isSeed,
  synchronize: false,
  logging: ['info', 'warn', 'error', 'migration'],
  entities,
  subscribers: [],
  migrations: [],
});
