import { Middleware } from 'routing-controllers';
import type { ExpressMiddlewareInterface } from 'routing-controllers';
import type { AuthorizationChecker } from 'routing-controllers/types/AuthorizationChecker';
import type { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';
import type { Request, Response, NextFunction } from 'express';
import { decodeToken } from '../utils/auth-utils';
import { UserRole } from '../entities/user';

@Middleware({ type: 'before' })
export class AuthMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    const header = req.get('authorization');

    if (header && header.startsWith('Bearer ')) {
      const token = header.replace('Bearer ', '');
      res.locals.user = decodeToken(token);
    }

    next();
  }
}

export const authorizationChecker: AuthorizationChecker = async (action, roles: UserRole[]) => {
  const { user } = (action.response as Response).locals;

  if (user && (roles.includes(user.role) || !roles.length)) {
    return true;
  }

  return false;
};

export const currentUserChecker: CurrentUserChecker = (action) => {
  const { user } = (action.response as Response).locals;
  return user;
};
