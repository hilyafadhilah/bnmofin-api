/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { faker } from '@faker-js/faker';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { DataSource } from 'typeorm';
import { Customer, CustomerStatus } from '../../entities/customer';
import { ResponseStatus } from '../../entities/response';
import { User, UserRole } from '../../entities/user';
import { RequestFactory } from '../factories/request-factory';
import { ResponseFactory } from '../factories/response-factory';

export class RequestSeeder extends Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const [admins, customers] = await Promise.all([
      dataSource.manager.findBy(User, { role: UserRole.Admin }),
      dataSource.manager.findBy(Customer, { status: CustomerStatus.Verified }),
    ]);

    const requestFactory = new RequestFactory();
    const responseFactory = new ResponseFactory();

    await Promise.all(customers.map((customer) => (
      requestFactory.makeMany(
        faker.datatype.number(50),
        { customer },
      )
        .then((requests) => dataSource.manager.save(requests))
        .then(async (requests) => {
          for (const request of requests) {
            if (faker.datatype.boolean()) {
              try {
                await dataSource.manager.transaction(async (em) => {
                  const response = await responseFactory.make({
                    request,
                    responder: faker.helpers.arrayElement(admins),
                  });

                  await em.save(response);

                  if (response.status === ResponseStatus.Accepted) {
                    await em.update(Customer, { userId: customer.userId }, {
                      balance: () => `balance + ${request.amount}`,
                    });
                  }
                });
              } catch {
              // failed response is ok
              }
            }
          }
        })
    )));
  }
}
