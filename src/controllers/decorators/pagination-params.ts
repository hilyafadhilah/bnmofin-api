import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { Action, createParamDecorator } from 'routing-controllers';
import { AppError, InvalidInput } from '../../error';
import { PaginationOptions } from '../params/pagination-options';

export type PaginationParamsOptions = {
  keep?: boolean
};

export function PaginationParams(options?: PaginationParamsOptions) {
  return createParamDecorator({
    required: false,
    value: async (action: Action) => {
      const req: Request = action.request;
      const paginationParams = plainToInstance(
        PaginationOptions,
        req.query,
        { excludeExtraneousValues: true, exposeDefaultValues: true },
      );

      try {
        await validateOrReject(paginationParams);
      } catch (err) {
        throw new AppError(InvalidInput({ thing: 'pagination options' }), err);
      }

      if (!options?.keep) {
        // Strip the fields from query
        Object.keys(paginationParams).forEach((key) => {
          delete req.query[key];
        });
      }

      return paginationParams;
    },
  });
}
