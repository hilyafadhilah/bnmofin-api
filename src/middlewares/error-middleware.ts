import {
  BadRequestError, ExpressErrorMiddlewareInterface, ForbiddenError, Middleware, UnauthorizedError,
} from 'routing-controllers';
import type { Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import { logger } from '../logger';
import {
  AppError, InvalidInput, NotFound, ServerError, Unauthorized,
} from '../error';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: Response): void {
    let appError : AppError | undefined;

    if (error instanceof AppError) {
      appError = error;
    } else {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        appError = new AppError(Unauthorized());
      } else if (error instanceof BadRequestError) {
        appError = new AppError(InvalidInput());
      } else if (error instanceof EntityNotFoundError) {
        appError = new AppError(NotFound({ thing: res.locals.resourceName }));
      } else if (error?.code === 'LIMIT_FILE_SIZE') {
        appError = new AppError(InvalidInput({
          thing: 'File',
          message: 'File too large.',
        }));
      } else {
        appError = new AppError(ServerError());
      }

      logger.error('[non-native error]', error);

      if (process.env.NODE_ENV !== 'production' && !appError.data) {
        appError.data = error;
        console.error(error);
      }
    }

    res.status(appError.httpCode);
    res.send(appError.toResponse());
  }
}
