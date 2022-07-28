import { Customer } from '../../../entities/customer';
import { Request } from '../../../entities/request';
import { Response } from '../../../entities/response';

export type RequestAppResponse = Omit<Request, 'response' | 'customer'> & {
  response: null | Omit<Response, 'responder' | 'requestId'> & {
    responder?: {
      username: Response['responder']['username']
    }
  }
  customer?: {
    fullname: Customer['fullname']
    balance: Customer['balance']
    user: {
      username: Customer['user']['username']
    }
  }
};
