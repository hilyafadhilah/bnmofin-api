import { Expose, Type } from 'class-transformer';
import { IsInstance, ValidateNested } from 'class-validator';
import { Money } from '../../models/money';

export class NewRequestParams {
  @IsInstance(Money)
  @ValidateNested()
  @Expose()
  @Type(() => Money)
  money!: Money;
}
