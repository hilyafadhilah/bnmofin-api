import { Response } from 'express';
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';
import { ErrorName } from '../errors';
import { AppError } from '../models/error';

@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any) {
    if (result === null) {
      throw new AppError(ErrorName.NOT_FOUND);
    }

    if (result === undefined) {
      (action.response as Response).status(204);
    }

    return result;
  }
}
