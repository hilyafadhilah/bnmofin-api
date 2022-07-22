import type { Handler } from 'express';

export function nameMiddleware(name: string): Handler {
  return (_, res, next) => {
    res.locals.resourceName = name;
    next();
  };
}
