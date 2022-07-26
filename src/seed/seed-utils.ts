import { DataSource, LessThanOrEqual, MoreThan } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer';
import { User, UserRole } from '../entities/user';

export async function printInfo(dataSource: DataSource) {
  const { logging } = dataSource.options;
  dataSource.setOptions({ logging: ['warn', 'error'] });

  const printer = (user: User) => console.info(`- ${user.username}`);

  console.info('\n--- Start Seeder Info ---\n');
  console.info('[Admin Accounts]');

  (await dataSource.manager.find(User, {
    where: { role: UserRole.Admin },
    take: 5,
  })).forEach(printer);

  console.info('\n[Customer Accounts (positive balance)]');

  (await dataSource.manager.find(Customer, {
    select: { user: { username: true } },
    relations: { user: true },
    where: {
      status: CustomerStatus.Verified,
      balance: MoreThan(0.0),
    },
    take: 5,
  })).forEach(({ user }) => printer(user));

  console.info('\n[Customer Accounts (negative balance)]');

  (await dataSource.manager.find(Customer, {
    select: { user: { username: true } },
    relations: { user: true },
    where: {
      status: CustomerStatus.Verified,
      balance: LessThanOrEqual(0.0),
    },
    take: 5,
  })).forEach(({ user }) => printer(user));

  console.info('\n--- End Seeder Info ---]\n');

  dataSource.setOptions({ logging });
}
