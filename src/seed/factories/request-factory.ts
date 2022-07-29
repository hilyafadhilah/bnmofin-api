import { faker } from '@faker-js/faker';
import {
  Constructable, FactorizedAttrs, Factory, InstanceAttribute, Subfactory,
} from '@jorgebodega/typeorm-seeding';
import { MoneyConfig } from '../../config/money-config';
import { Request } from '../../entities/request';
import { CustomerFactory } from './customer-factory';

export class RequestFactory extends Factory<Request> {
  protected entity: Constructable<Request> = Request;

  protected attrs(): FactorizedAttrs<Request> {
    return {
      amount: parseFloat(faker.finance.amount(
        MoneyConfig.limit.request.min,
        MoneyConfig.limit.request.max,
        6,
      )),
      customer: new Subfactory(CustomerFactory),
      created: new InstanceAttribute((i) => faker.date.between(i.customer.created, new Date())),
    };
  }
}
