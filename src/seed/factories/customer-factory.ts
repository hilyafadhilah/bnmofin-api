import { faker } from '@faker-js/faker';
import {
  FactorizedAttrs, Factory, InstanceAttribute, Subfactory,
} from '@jorgebodega/typeorm-seeding';
import { IdCardUploadConfig } from '../../config/fileupload-config';
import { Customer, CustomerStatus } from '../../entities/customer';
import { UserRole } from '../../entities/user';
import { UserFactory } from './user-factory';

export class CustomerFactory extends Factory<Customer> {
  protected entity = Customer;

  protected attrs(): FactorizedAttrs<Customer> {
    const fullname = faker.name.findName();
    const status = faker.datatype.boolean() ? CustomerStatus.Unverified : CustomerStatus.Verified;
    const balance = status === CustomerStatus.Unverified
      ? 0
      : faker.datatype.number({ max: 99999999, precision: 0.000001 });
    const created = faker.date.past(5);

    const fileName = (id: number) => {
      const ext = faker.helpers.arrayElement(['jpg', 'jpeg', 'png', 'gif']);
      return `${IdCardUploadConfig.dirname}/${id}.${ext}`;
    };

    return {
      fullname,
      status,
      balance,
      idCardImage: new InstanceAttribute(({ user }) => fileName(user.id)),
      created,
      user: new Subfactory(UserFactory, {
        role: UserRole.Customer,
        created,
      }),
    };
  }
}
