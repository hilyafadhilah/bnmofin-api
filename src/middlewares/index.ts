import { AuthMiddleware } from './auth-middleware';
import { ErrorMiddleware } from './error-middleware';

export const middlewares = [
  AuthMiddleware,
  ErrorMiddleware,
];
