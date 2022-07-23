import { Middleware } from 'routing-controllers';
import type { ExpressMiddlewareInterface } from 'routing-controllers';
import type { AuthorizationChecker } from 'routing-controllers/types/AuthorizationChecker';
import type { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';
import type { Request, Response, NextFunction } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { decodeToken } from '../utils/auth-utils';
import { AuthRole } from '../models/auth';
import { AppError } from '../models/error';
import { ErrorName } from '../errors';

@Middleware({ type: 'before' })
export class AuthMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    const header = req.get('authorization');

    try {
      if (header && header.startsWith('Bearer ')) {
        const token = header.replace('Bearer ', '');
        res.locals.user = decodeToken(token);
      }

      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        next(new AppError(ErrorName.TokenExpired));
      } else {
        next(new AppError(ErrorName.InvalidToken));
      }
    }
  }
}

export const authorizationChecker: AuthorizationChecker = async (action, roles: AuthRole[]) => {
  const { user } = (action.response as Response).locals;
  return (user && (
    roles.includes(user.role) || roles.includes(AuthRole.Any) || !roles.length
  ));
};

export const currentUserChecker: CurrentUserChecker = (action) => {
  const { user } = (action.response as Response).locals;
  return user;
};
