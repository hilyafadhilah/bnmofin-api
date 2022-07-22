import type { Response } from 'express';
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';
import { ErrorName } from '../errors';
import { logger } from '../logger';
import { AppError } from '../models/error';
import { BaseResponse } from '../models/responses/base-response';
import { SingularResponse } from '../models/responses/singular-response';

@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any) {
    if (result === null) {
      throw new AppError(ErrorName.NotFound, (action.response as Response).locals.resourceName);
    }

    if (result === undefined) {
      (action.response as Response).status(204);
    }

    if (result instanceof BaseResponse) {
      return result.toObject();
    }

    if (Array.isArray(result)) {
      logger.error('Internal: Array response must be instanceof CollectionResponse', { response: result });
      throw new AppError(ErrorName.ServerError);
    }

    return new SingularResponse(result).toObject();
  }
}
