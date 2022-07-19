import { Expose, Type } from 'class-transformer';
import {
  IsIn, IsInt, IsOptional, IsPositive,
} from 'class-validator';

export const allowedPageSizes = [
  25, 50, 100, 250,
];

export class PaginationOptions {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsIn(allowedPageSizes)
  @Expose()
  @Type(() => Number)
  pageSize: number = 50;
}
