import { faker } from '@faker-js/faker';
import {
  Constructable, FactorizedAttrs, Factory, InstanceAttribute, Subfactory,
} from '@jorgebodega/typeorm-seeding';
import { Response, ResponseStatus } from '../../entities/response';
import { RequestFactory } from './request-factory';
import { UserFactory } from './user-factory';

export class ResponseFactory extends Factory<Response> {
  protected entity: Constructable<Response> = Response;

  protected attrs(): FactorizedAttrs<Response> {
    return {
      request: new Subfactory(RequestFactory),
      responder: new Subfactory(UserFactory),
      status: faker.datatype.boolean() ? ResponseStatus.Accepted : ResponseStatus.Declined,
      created: new InstanceAttribute((i) => faker.date.between(i.request.created, new Date())),
    };
  }
}
