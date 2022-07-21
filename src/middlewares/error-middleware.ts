import {
  BadRequestError, ExpressErrorMiddlewareInterface, ForbiddenError, Middleware, UnauthorizedError,
} from 'routing-controllers';
import { Response } from 'express';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';
import { logger } from '../logger';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: Response): void {
    let appError : AppError | undefined;

    if (error instanceof AppError) {
      appError = error;
    } else {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        appError = new AppError(ErrorName.Unauthorized);
      } else if (error instanceof BadRequestError) {
        appError = new AppError(ErrorName.InvalidInput);
      } else {
        appError = new AppError(ErrorName.ServerError);
      }

      if (process.env.NODE_ENV !== 'production' && !appError.data) {
        appError.data = error;
        logger.error('[non-native error]', error);
        console.error(error);
      }
    }

    res.status(appError.httpCode);
    res.send(appError.toResponse());
  }
}
