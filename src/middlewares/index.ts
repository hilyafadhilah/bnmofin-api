import { AuthMiddleware } from './auth-middleware';
import { ErrorMiddleware } from './error-middleware';
import { ResponseInterceptor } from './response-interceptor';

export const middlewares = [
  AuthMiddleware,
  ErrorMiddleware,
];

export const interceptors = [
  ResponseInterceptor,
];

export { authorizationChecker, currentUserChecker } from './auth-middleware';
