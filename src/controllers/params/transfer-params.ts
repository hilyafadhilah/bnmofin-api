import { Expose, Type } from 'class-transformer';
import {
  IsInstance, IsNotEmpty, ValidateNested,
} from 'class-validator';
import { Money } from '../../models/money';

export class IssueTransferParams {
  @IsNotEmpty()
  @Type(() => String)
  username!: string;

  @IsInstance(Money)
  @ValidateNested()
  @Expose()
  @Type(() => Money)
  money!: Money;
}
