import { Expose, Type } from 'class-transformer';
import {
  IsInstance, IsInt, IsPositive, ValidateNested,
} from 'class-validator';
import { Money } from '../../models/money';

export class IssueTransferParams {
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  receiverId!: number;

  @IsInstance(Money)
  @ValidateNested()
  @Expose()
  @Type(() => Money)
  money!: Money;
}
