import { DataSource } from 'typeorm';
import { Customer } from './entities/customer';
import { Request } from './entities/request';
import { Transfer } from './entities/transfer';
import { User } from './entities/user';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  synchronize: true,
  logging: true,
  entities: [User, Customer, Request, Transfer],
  subscribers: [],
  migrations: [],
});

export default dataSource;
