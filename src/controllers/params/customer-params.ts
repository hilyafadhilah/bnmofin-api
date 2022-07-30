import { Expose, Type } from 'class-transformer';
import { IsInstance, IsOptional, ValidateNested } from 'class-validator';
import { QueryStringOptions } from './query-options';

export class CustomerQueryParams {
  @IsOptional()
  @ValidateNested()
  @IsInstance(QueryStringOptions)
  @Expose()
  @Type(() => QueryStringOptions)
  fullname?: QueryStringOptions;

  @IsOptional()
  @ValidateNested()
  @IsInstance(QueryStringOptions)
  @Expose()
  @Type(() => QueryStringOptions)
  username?: QueryStringOptions;
}
