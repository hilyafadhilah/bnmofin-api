import {
  BadRequestError, ExpressErrorMiddlewareInterface, ForbiddenError, Middleware, UnauthorizedError,
} from 'routing-controllers';
import type { Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';
import { logger } from '../logger';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: Response): void {
    let appError : AppError | undefined;

    if (error instanceof AppError) {
      appError = error;

      if (error.name === ErrorName.NotFound && error.data == null) {
        appError = new AppError(ErrorName.NotFound, res.locals.resourceName);
      }
    } else {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        appError = new AppError(ErrorName.Unauthorized);
      } else if (error instanceof BadRequestError) {
        appError = new AppError(ErrorName.InvalidInput);
      } else if (error instanceof EntityNotFoundError) {
        appError = new AppError(ErrorName.NotFound, res.locals.resourceName);
      } else {
        appError = new AppError(ErrorName.ServerError);
      }

      if (process.env.NODE_ENV !== 'production' && !appError.data) {
        appError.data = error;
        logger.error('[non-native error]', error);
        // console.error(error);
      }
    }

    res.status(appError.httpCode);
    res.send(appError.toResponse());
  }
}
