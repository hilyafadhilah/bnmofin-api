import { AuthController } from './auth-controller';
import { CurrencyController } from './currency-controller';
import { CustomerController } from './customer-controller';
import { RequestController } from './request-controller';
import { TransferController } from './transfer-controller';

export const controllers = [
  CustomerController,
  AuthController,
  RequestController,
  TransferController,
  CurrencyController,
];
