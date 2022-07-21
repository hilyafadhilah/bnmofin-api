import { Expose, Type } from 'class-transformer';
import { IsNumber, Length } from 'class-validator';

export class Money {
  @IsNumber()
  @Expose()
  @Type(() => Number)
  amount!: number;

  @Length(3, 3)
  @Expose()
  currency!: string;
}
