import type { Response } from 'express';
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';
import { AppError, NotFound, ServerError } from '../error';
import { logger } from '../logger';
import { BaseAppResponse } from '../models/responses/base-appresponse';
import { SingularAppResponse } from '../models/responses/singular-appresponse';

@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any) {
    if (result === null) {
      throw new AppError(NotFound({ thing: (action.response as Response).locals.resourceName }));
    }

    if (result === undefined) {
      (action.response as Response).status(204);
    }

    if (result instanceof BaseAppResponse) {
      return result.toObject();
    }

    if (Array.isArray(result)) {
      logger.error('Internal: Array response must be instanceof CollectionAppResponse', { response: result });
      throw new AppError(ServerError());
    }

    return new SingularAppResponse(result).toObject();
  }
}
