import { faker } from '@faker-js/faker';
import { Constructable, FactorizedAttrs, Factory } from '@jorgebodega/typeorm-seeding';
import { User, UserRole } from '../../entities/user';
import { hashPassword } from '../../utils/auth-utils';

export class UserFactory extends Factory<User> {
  protected entity: Constructable<User> = User;

  protected attrs(): FactorizedAttrs<User> {
    const username = (
      faker.name.firstName() + faker.random.alphaNumeric(5)
    );

    return {
      username,
      password: () => hashPassword(username),
      role: UserRole.Admin,
      created: faker.date.past(5),
    };
  }
}
