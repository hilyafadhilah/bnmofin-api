import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationOptions {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Expose()
  @Type(() => Number)
  skip: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Expose()
  @Transform(({ value }) => (value ? Math.min(Number(value), 200) : 50))
  take: number = 50;
}
