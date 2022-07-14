import {
  BadRequestError, ExpressErrorMiddlewareInterface, ForbiddenError, Middleware, UnauthorizedError,
} from 'routing-controllers';
import { Response } from 'express';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: Response): void {
    let appError : AppError | undefined;

    if (error instanceof AppError) {
      appError = error;
    } else {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        appError = new AppError(ErrorName.UNAUTHORIZED);
      } else if (error instanceof BadRequestError) {
        appError = new AppError(ErrorName.INVALID_INPUT);
      } else {
        appError = new AppError(ErrorName.SERVER_ERROR);
      }

      if (process.env.NODE_ENV !== 'production' && !appError.data) {
        appError.data = error;
      }
    }

    res.status(appError.httpCode);
    res.send(appError.toResponse());
  }
}
