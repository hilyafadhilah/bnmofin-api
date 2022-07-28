import { Expose, Type } from 'class-transformer';
import {
  IsNotIn, IsNumber, Length, Max,
} from 'class-validator';

export class Money {
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 2,
  }, { always: true })
  @Expose()
  @Max(999999999999999.9, { always: true })
  @IsNotIn([0], { always: true })
  @Type(() => Number)
  amount!: number;

  @Length(3, 3, { always: true })
  @Expose()
  currency!: string;
}
