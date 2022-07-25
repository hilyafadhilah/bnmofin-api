import { Expose, Type } from 'class-transformer';
import { IsNumber, Length, Max } from 'class-validator';

export class Money {
  @IsNumber()
  @Expose()
  @Max(999999999999999.9)
  @Type(() => Number)
  amount!: number;

  @Length(3, 3)
  @Expose()
  currency!: string;
}
