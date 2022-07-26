import type { Response } from 'express';
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';
import { ErrorName } from '../errors';
import { logger } from '../logger';
import { AppError } from '../models/error';
import { BaseAppResponse } from '../models/responses/base-appresponse';
import { SingularAppResponse } from '../models/responses/singular-appresponse';

@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any) {
    if (result === null) {
      throw new AppError(ErrorName.NotFound, (action.response as Response).locals.resourceName);
    }

    if (result === undefined) {
      (action.response as Response).status(204);
    }

    if (result instanceof BaseAppResponse) {
      return result.toObject();
    }

    if (Array.isArray(result)) {
      logger.error('Internal: Array response must be instanceof CollectionAppResponse', { response: result });
      throw new AppError(ErrorName.ServerError);
    }

    return new SingularAppResponse(result).toObject();
  }
}
